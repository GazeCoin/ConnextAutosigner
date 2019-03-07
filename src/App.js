import React from "react";
import "./App.css";
import { setWallet } from "./utils/actions.js";
import { createStore } from "redux";
import { BrowserRouter as Router, Route, Redirect } from "react-router-dom";
import Home from "./components/Home";
import DepositCard from "./components/depositCard";
import { getConnextClient } from "connext/dist/Connext.js";
import ProviderOptions from "./utils/ProviderOptions.ts";
import clientProvider from "./utils/web3/clientProvider.ts";
import { createWalletFromMnemonic } from "./walletGen";
import axios from "axios";
import { Paper, withStyles } from "@material-ui/core";
import AppBarComponent from "./components/AppBar";
import SettingsCard from "./components/settingsCard";
import ReceiveCard from "./components/receiveCard";
import SendCard from "./components/sendCard";
import CashOutCard from "./components/cashOutCard";
import SupportCard from "./components/supportCard";
import { createWallet } from "./walletGen";
import RedeemCard from "./components/redeemCard";
import Confirmations from './components/Confirmations';
import BigNumber from "bignumber.js";
import { calculateExchange } from 'connext/dist/StateGenerator.js'
import { convertExchange } from "connext/dist/types";

export const store = createStore(setWallet, null);

const Web3 = require("web3");
const eth = require("ethers");
const humanTokenAbi = require("./abi/humanToken.json");

const env = process.env.NODE_ENV;
const tokenAbi = humanTokenAbi;
console.log(`starting app in env: ${JSON.stringify(process.env, null, 1)}`);

const publicUrl = process.env.REACT_APP_PUBLIC_URL.toLowerCase();

const overrides = {
  localHub: process.env.REACT_APP_LOCAL_HUB_OVERRIDE,
  localEth: process.env.REACT_APP_LOCAL_ETH_OVERRIDE,
  rinkebyHub: process.env.REACT_APP_RINKEBY_HUB_OVERRIDE,
  rinkebyEth: process.env.REACT_APP_RINKEBY_ETH_OVERRIDE,
  mainnetHub: process.env.REACT_APP_MAINNET_HUB_OVERRIDE,
  mainnetEth: process.env.REACT_APP_MAINNET_ETH_OVERRIDE
}

const HASH_PREAMBLE = "SpankWallet authentication message:";
const DEPOSIT_MINIMUM_WEI = eth.utils.parseEther("0.03"); // 30 FIN
const HUB_EXCHANGE_CEILING = eth.utils.parseEther("69"); // 69 TST
const CHANNEL_DEPOSIT_MAX = eth.utils.parseEther("30"); // 30 TST

const opts = {
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    Authorization: "Bearer foo"
  },
  withCredentials: true
};

const styles = theme => ({
  paper: {
    height: "100%",
    width: "100%",
    [theme.breakpoints.up(600)]: {
      width: 550
    },
    zIndex: 1000,
    margin: "0px",
  },
  app: {
    display: "flex",
    justifyContent: "center",
    flexGrow: 1,
    fontFamily: ["proxima-nova", "sans-serif"],
    backgroundColor: "#FFF",
    width: "100%",
    margin: "0px",
    [theme.breakpoints.up(824)]: {
      height: "100%"
    },
    [theme.breakpoints.down(824)]: {
      height: "100vh"
    }
  },
  zIndex: 1000,
  grid: {}
});

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      rpcUrl: null,
      hubUrl: null,
      tokenAddress: null,
      channelManagerAddress: null,
      hubWalletAddress: null,
      web3: null,
      customWeb3: null,
      tokenContract: null,
      connext: null,
      delegateSigner: null,
      modals: {
        settings: false,
        keyGen: false,
        receive: false,
        send: false,
        cashOut: false,
        scan: false,
        deposit: false
      },
      authorized: "false",
      approvalWeiUser: "10000",
      channelState: null,
      exchangeRate: "0.00",
      interval: null,
      connextState: null,
      runtime: null,
      sendScanArgs: {
        amount: null,
        recipient: null
      },
      address: "",
      status: {
        deposit: "",
        withdraw: "",
        payment: "",
        hasRefund: "",
      },
    };

    this.networkHandler = this.networkHandler.bind(this);
  }

  // ************************************************* //
  //                     Hooks                         //
  // ************************************************* //

  async componentDidMount() {
    // Set up state
    const mnemonic = localStorage.getItem("mnemonic")
    // on mount, check if you need to refund by removing maxBalance
    localStorage.removeItem("refunding")
    let rpc = localStorage.getItem("rpc");
    // TODO: better way to set default provider
    // if it doesnt exist in storage
    if (!rpc) {
      rpc = env === "development" ? "LOCALHOST" : "RINKEBY";
      localStorage.setItem("rpc", rpc);
    }
    // If a browser address exists, create wallet
    if (mnemonic) {
      const delegateSigner = await createWalletFromMnemonic(mnemonic);
      const address = await delegateSigner.getAddressString();
      console.log("Autosigner address: ", address);
      this.setState({ delegateSigner, address });
      store.dispatch({
        type: "SET_WALLET",
        text: delegateSigner
      });

      // // If a browser address exists, instantiate connext
      // console.log('this.state.delegateSigner', this.state.delegateSigner)
      // if (this.state.delegateSigner) {
      await this.setWeb3(rpc);
      await this.setConnext();
      await this.setTokenContract();

      await this.pollConnextState();
      await this.poller();
    } else {
      // Else, we wait for user to finish selecting through modal which will refresh page when done
      // TODO
      // const { modals } = this.state;
      // this.setState({ modals: { ...modals, keyGen: true } });
      await createWallet(this.state.web3);
      // Then refresh the page
      window.location.reload();
    }
  }

  // ************************************************* //
  //                State setters                      //
  // ************************************************* //

  async networkHandler(rpc) {
    // called from settingsCard when a new RPC URL is connected
    // will create a new custom web3 and reinstantiate connext
    localStorage.setItem("rpc", rpc);
    // update refunding variable on rpc switch
    localStorage.removeItem("maxBalanceAfterRefund")
    localStorage.removeItem("refunding")
    await this.setWeb3(rpc);
    await this.setConnext();
    await this.setTokenContract();
    return;
  }

  // either LOCALHOST MAINNET or RINKEBY
  async setWeb3(rpc) {
    let rpcUrl, hubUrl;
    switch (rpc) {
      case "LOCALHOST":
        rpcUrl = overrides.localEth || `${publicUrl}/api/local/eth`;
        hubUrl = overrides.localHub || `${publicUrl}/api/local/hub`;
        break;
      case "RINKEBY":
        rpcUrl = overrides.rinkebyEth || `${publicUrl}/api/rinkeby/eth`;
        hubUrl = overrides.rinkebyHub || `${publicUrl}/api/rinkeby/hub`;
        break;
      case "MAINNET":
        rpcUrl = overrides.mainnetEth || `${publicUrl}/api/mainnet/eth`;
        hubUrl = overrides.mainnetHub || `${publicUrl}/api/mainnet/hub`;
        break;
      default:
        throw new Error(`Unrecognized rpc: ${rpc}`);
    }
    console.log("Custom provider with rpc:", rpcUrl);

    // Ask permission to view accounts
    let windowId;
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      windowId = await window.web3.eth.net.getId();
    }

    const providerOpts = new ProviderOptions(store, rpcUrl).approving();
    const provider = clientProvider(providerOpts);
    const customWeb3 = new Web3(provider);
    const customId = await customWeb3.eth.net.getId();
    // NOTE: token/contract/hubWallet ddresses are set to state while initializing connext
    this.setState({ customWeb3, hubUrl, rpcUrl });
    if (windowId && windowId !== customId) {
      alert(`Your card is set to ${JSON.stringify(rpc)}. To avoid losing funds, please make sure your metamask and card are using the same network.`);
    }
    return;
  }

  async setTokenContract() {
    try {
      let { customWeb3, tokenAddress } = this.state;
      const tokenContract = new customWeb3.eth.Contract(tokenAbi, tokenAddress);
      this.setState({ tokenContract });
      console.log("Set up token contract details");
    } catch (e) {
      console.log("Error setting token contract");
      console.log(e);
    }
  }

  async setConnext() {
    const { address, customWeb3, hubUrl } = this.state;

    const opts = {
      web3: customWeb3,
      hubUrl, // in dev-mode: http://localhost:8080,
      user: address,
      origin: "localhost", // TODO: what should this be
    };
    console.log("Setting up connext with opts:", opts);

    // *** Instantiate the connext client ***
    const connext = await getConnextClient(opts);
    console.log(`Successfully set up connext! Connext config:`);
    console.log(`  - tokenAddress: ${connext.opts.tokenAddress}`);
    console.log(`  - hubAddress: ${connext.opts.hubAddress}`);
    console.log(`  - contractAddress: ${connext.opts.contractAddress}`);
    console.log(`  - ethNetworkId: ${connext.opts.ethNetworkId}`);
    this.setState({
      connext,
      tokenAddress: connext.opts.tokenAddress,
      channelManagerAddress: connext.opts.contractAddress,
      hubWalletAddress: connext.opts.hubAddress,
      ethNetworkId: connext.opts.ethNetworkId
    });
  }

  // ************************************************* //
  //                    Pollers                        //
  // ************************************************* //

  async pollConnextState() {
    let connext = this.state.connext;
    // register listeners
    connext.on("onStateChange", state => {
      console.log("Connext state changed:", state);
      this.setState({
        channelState: state.persistent.channel,
        connextState: state,
        runtime: state.runtime,
        exchangeRate: state.runtime.exchangeRate ? state.runtime.exchangeRate.rates.USD : 0
      });
    });
    // start polling
    await connext.start();
  }

  async poller() {
    await this.autoDeposit();
    await this.autoSwap();

    setInterval(async () => {
      await this.autoDeposit();
    }, 5000);

    setInterval(async () => {
      await this.autoSwap();
    }, 1000);

    setInterval(async() => {
      await this.checkStatus();
    }, 400);
  }

  async autoDeposit() {
    const { address, tokenContract, connextState, tokenAddress, exchangeRate, channelState, rpcUrl } = this.state;
    if (!rpcUrl) {
      return
    }
    const web3 = new Web3(rpcUrl)
    const balance = await web3.eth.getBalance(address);

    const refunding = localStorage.getItem('refunding')
    if (refunding) {
      return
    }

    const maxBalanceAfterRefund = localStorage.getItem("maxBalanceAfterRefund")
    if (maxBalanceAfterRefund && new BigNumber(balance).gte(new BigNumber(maxBalanceAfterRefund))) {
      // wallet balance hasnt changed since submitting tx, returning
      return
    } else {
      // tx has been submitted, delete the maxWalletBalance from storage
      localStorage.removeItem("refunding")
      localStorage.removeItem("maxBalanceAfterRefund")
    }

    let tokenBalance = "0";
    try {
      tokenBalance = await tokenContract.methods.balanceOf(address).call();
    } catch (e) {
      console.warn(
        `Error fetching token balance, are you sure the token address (addr: ${tokenAddress}) is correct for the selected network (id: ${await web3.eth.net.getId()}))? Error: ${
          e.message
        }`
      );
    }

    if (balance !== "0" || tokenBalance !== "0") {
      if (eth.utils.bigNumberify(balance).lte(DEPOSIT_MINIMUM_WEI)) {
        // don't autodeposit anything under the threshold
        // update the refunding variable before returning
        return;
      }
      // only proceed with deposit request if you can deposit
      if (!connextState || !connextState.runtime.canDeposit || exchangeRate === "0.00") {
        return;
      }

      // if you already have the maximum balance tokens hub will exchange
      // do not deposit any more eth to be swapped
      // TODO: figure out rounding error
      if (eth.utils.bigNumberify(channelState.balanceTokenUser).gte(eth.utils.parseEther("29.8"))) {
        console.log('Channel state token balance at max, refunding browser balance')
        // refund any wei that is in the browser wallet 
        // above the minimum
        const refundWei = BigNumber.max(
          new BigNumber(balance).minus(DEPOSIT_MINIMUM_WEI),
          0
        )
        await this.returnWei(refundWei.toString())
        return
      }

      let channelDeposit = {
        amountWei: eth.utils
          .bigNumberify(balance)
          .sub(DEPOSIT_MINIMUM_WEI)
          .toString(),
        amountToken: tokenBalance
      };

      if (channelDeposit.amountWei === "0" && channelDeposit.amountToken === "0") {
        return;
      }

      // if amount to deposit into channel is over the channel max
      // then return excess deposit to the sending account
      const weiToReturn = this.calculateWeiToRefund(channelDeposit.amountWei, exchangeRate)

      // return wei to sender
      if (!weiToReturn.isZero()) {
        await this.returnWei(weiToReturn.toString())
        return
      }
      // update channel deposit
      const weiDeposit = new BigNumber(channelDeposit.amountWei).minus(
        weiToReturn
      )
      channelDeposit.amountWei = weiDeposit.toString()

      console.log(`Depositing: ${JSON.stringify(channelDeposit, null, 2)}`);
      let depositRes = await this.state.connext.deposit(channelDeposit);
      console.log(`Deposit Result: ${JSON.stringify(depositRes, null, 2)}`);
    }
  }

  async returnWei(wei) {
    const { address, customWeb3 } = this.state;
    localStorage.setItem('refunding', Web3.utils.fromWei(wei, 'finney'))

    if (!customWeb3) {
      return
    }

    // if wei is 0, save gas and return
    if (wei === "0") {
      return
    }

    // get address of latest sender of most recent transaction
    // first, get the last 10 blocks
    const currentBlock = await customWeb3.eth.getBlockNumber()
    let txs = []
    const start = (currentBlock - 100) < 0 ? 0 : currentBlock - 100
    for (let i = start; i <= currentBlock; i++) {
      // add any transactions found in the blocks to the txs array
      const block = await customWeb3.eth.getBlock(i, true)
      txs = txs.concat(block.transactions)
    }
    // sort by nonce and take latest senders address and
    // return wei to the senders address
    const filteredTxs = txs.filter(t => t.to && t.to.toLowerCase() === address.toLowerCase())
    const mostRecent = (filteredTxs.sort((a, b) => b.nonce - a.nonce))[0]
    if (!mostRecent) {
      console.log('Browser wallet overfunded, but couldnt find most recent tx in last 100 blocks.')
      return
    }
    localStorage.setItem('refunding', Web3.utils.fromWei(wei, 'finney') + ',' + mostRecent.from)
    console.log(`Refunding ${wei} to ${mostRecent.from} from ${address}`)
    const origBalance = new BigNumber(await customWeb3.eth.getBalance(address))
    const newMax = origBalance.minus(new BigNumber(wei))

    try {
      const res = await customWeb3.eth.sendTransaction({
        from: address,
        to: mostRecent.from,
        value: wei,
      })
      const tx = await customWeb3.eth.getTransaction(res.transactionHash)
      console.log('refundTx', tx)
      // calculate expected balance after transaction and set in local
      // storage. once the tx is submitted, the wallet balance should
      // always be lower than the expected balance, because of added
      // gas costs
      localStorage.setItem('maxBalanceAfterRefund', newMax.toString())
    } catch (e) {
      console.log('Error with refund transaction:', e.message)
      localStorage.removeItem('maxBalanceAfterRefund')
    }
    localStorage.removeItem('refunding')
    await this.setWeb3(localStorage.getItem('rpc'))
  }

  // returns a BigNumber
  calculateWeiToRefund(wei, exchangeRate) {
    // channel max tokens is minimum of the ceiling that
    // the hub would exchange, or a set deposit max
    const maxTokens = BigNumber.min(
      HUB_EXCHANGE_CEILING,
      CHANNEL_DEPOSIT_MAX,
    )
    // calculate the max wei the hub is willing to exchange
    const maxWeiExchanged = {
      exchangeRate,
      seller: "user",
      tokensToSell: maxTokens.toString(),
      weiToSell: "0"
    }

    // see notes in src about tokensSold for "calculateExchange"
    const { weiReceived } = calculateExchange(convertExchange('bn', maxWeiExchanged))

    let weiToRefund = new BigNumber(wei).minus(new BigNumber(weiReceived.toString()))
    
    if (weiToRefund.isNegative()) {
      return new BigNumber(0)
    }

    return weiToRefund
  }

  async autoSwap() {
    const { channelState, connextState } = this.state;
    if (!connextState || !connextState.runtime.canExchange) {
      // console.log("Cannot exchange");
      return;
    }
    const weiBalance = eth.utils.bigNumberify(channelState.balanceWeiUser);
    const tokenBalance = eth.utils.bigNumberify(channelState.balanceTokenUser);
    if (channelState && weiBalance.gt(eth.utils.bigNumberify("0")) && tokenBalance.lte(HUB_EXCHANGE_CEILING)) {
      console.log(`Exchanging ${channelState.balanceWeiUser} wei`);
      await this.state.connext.exchange(channelState.balanceWeiUser, "wei");
    }
  }

  async checkStatus() {
    const { runtime } = this.state;
    const refundStr = localStorage.getItem('refunding')
    const hasRefund = !!refundStr ? refundStr.split(',') : null
    let deposit = null;
    let payment = null;
    let withdraw = null;
    if (runtime.syncResultsFromHub[0]) {
      switch (runtime.syncResultsFromHub[0].update.reason) {
        case "ProposePendingDeposit":
          deposit = "PENDING";
          break;
        case "ProposePendingWithdrawal":
          withdraw = "PENDING";
          break;
        case "ConfirmPending":
          withdraw = "SUCCESS";
          break;
        case "Payment":
          payment = "SUCCESS";
          break;
        default:
          deposit = null;
          withdraw = null;
          payment = null;
      }
    }
    this.setState({ status: {deposit, withdraw, payment, hasRefund} });
  }

  // ************************************************* //
  //                    Handlers                       //
  // ************************************************* //

  updateApprovalHandler(evt) {
    this.setState({
      approvalWeiUser: evt.target.value
    });
  }

  async scanURL(path, args) {
    switch (path) {
      case '/send': 
        this.setState({
          sendScanArgs: { ...args }
        });
        break;
      case '/redeem': 
        this.setState({
          redeemScanArgs: { ...args }
        });
        break;
      default: 
        return
    }
  }

  async closeConfirmations() {
    let deposit = null;
    let payment = null;
    let withdraw = null;
    let hasRefund = null;
    this.setState({status: {deposit, payment, withdraw, hasRefund}})
  }

  render() {
    const { address, channelState, sendScanArgs, exchangeRate, customWeb3, connext, connextState, runtime } = this.state;
    const { classes } = this.props;
    return (
      <Router>
        <div className={classes.app}>
          <Paper className={classes.paper} elevation={1}>
            <Confirmations status={this.state.status} closeConfirmations={this.closeConfirmations.bind(this)}/>
            <AppBarComponent address={address} />
            <Route
              exact
              path="/"
              render={props => runtime && runtime.channelStatus != 'CS_OPEN' ? (
                <Redirect to="/support" />
              ) : (
                <Home {...props} address={address} connextState={connextState} channelState={channelState} publicUrl={publicUrl} scanURL={this.scanURL.bind(this)} />
              )}
            />
            <Route
              path="/deposit"
              render={props => <DepositCard {...props} address={address} minDepositWei={DEPOSIT_MINIMUM_WEI} exchangeRate={exchangeRate} maxTokenDeposit={CHANNEL_DEPOSIT_MAX} />}
            />
            <Route path="/settings" render={props => <SettingsCard {...props} networkHandler={this.networkHandler} connext={connext} address={address} exchangeRate={exchangeRate} runtime={this.state.runtime}/>} />
            <Route path="/receive" render={props => <ReceiveCard {...props} address={address} channelState={channelState} publicUrl={publicUrl} />} />
            <Route
              path="/send"
              render={props => (
                <SendCard
                  {...props}
                  web3={customWeb3}
                  connext={connext}
                  address={address}
                  channelState={channelState}
                  publicUrl={publicUrl}
                  scanArgs={sendScanArgs}
                />
              )}
            />
            <Route
              path="/redeem"
              render={props => (
                <RedeemCard 
                  {...props} 
                  publicUrl={publicUrl}
                  connext={connext}
                  channelState={channelState}
                  connextState={connextState}
                  />
              )}
            />
            <Route
              path="/cashout"
              render={props => (
                <CashOutCard
                  {...props}
                  address={address}
                  channelState={channelState}
                  publicUrl={publicUrl}
                  exchangeRate={exchangeRate}
                  web3={customWeb3}
                  connext={connext}
                  connextState={connextState}
                />
              )}
            />
            <Route
              path="/support"
              render={props => (
                <SupportCard
                  {...props}
                  channelState={channelState}
                  web3={customWeb3}
                  connext={connext}
                  connextState={connextState}
                />
              )}
            />
          </Paper>
        </div>
      </Router>
    );
  }
}

export default withStyles(styles)(App);
