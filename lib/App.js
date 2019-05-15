"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.store = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
//import { getConnextClient } from "connext/dist/Connext.js";

//import BigNumber from "bignumber.js";
//import {CurrencyType} from "connext/dist/state/ConnextState/CurrencyTypes";
//import CurrencyConvertable from "connext/dist/lib/currency/CurrencyConvertable";
//import getExchangeRates from "connext/dist/lib/getExchangeRates";


exports.start = start;

var _actions = require("./utils/actions.js");

var _redux = require("redux");

var _connext = require("connext");

var _connext2 = _interopRequireDefault(_connext);

var _dist = require("connext/dist");

var _ProviderOptions = require("../dist/utils/ProviderOptions.js");

var _ProviderOptions2 = _interopRequireDefault(_ProviderOptions);

var _clientProvider = require("../dist/utils/web3/clientProvider.js");

var _clientProvider2 = _interopRequireDefault(_clientProvider);

var _bn = require("connext/dist/lib/bn.js");

var _walletGen = require("./walletGen");

var _axios = require("axios");

var _axios2 = _interopRequireDefault(_axios);

var _intervalPromise = require("interval-promise");

var _intervalPromise2 = _interopRequireDefault(_intervalPromise);

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _Storage = require("./utils/Storage.js");

var _Storage2 = _interopRequireDefault(_Storage);

var _express = require("express");

var _express2 = _interopRequireDefault(_express);

var _http = require("http");

var _http2 = _interopRequireDefault(_http);

var _socket = require("socket.io");

var _socket2 = _interopRequireDefault(_socket);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var CurrencyType = _dist.types.CurrencyType,
    CurrencyConvertable = _dist.types.CurrencyConvertable;

var _ref = new _connext2.default.Utils(),
    getExchangeRates = _ref.getExchangeRates,
    hasPendingOps = _ref.hasPendingOps;
//const { Big, maxBN, minBN } = Connext.big


var store = exports.store = (0, _redux.createStore)(_actions.setWallet, null);

var publicUrl = 'localhost';
var localStorage = new _Storage2.default();
var webSocket = void 0;

var Web3 = require("web3");
var eth = require("ethers");
//const BN = Web3.utils.BN;
//const humanTokenAbi = require("./abi/humanToken.json");

var env = process.env.NODE_ENV;
var ERC20 = [{ "constant": true, "inputs": [], "name": "name", "outputs": [{ "name": "", "type": "string" }], "payable": false, "type": "function" }, { "constant": true, "inputs": [], "name": "minter", "outputs": [{ "name": "", "type": "address" }], "payable": false, "type": "function" }, { "constant": false, "inputs": [{ "name": "_spender", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "approve", "outputs": [{ "name": "o_success", "type": "bool" }], "payable": false, "type": "function" }, { "constant": true, "inputs": [], "name": "totalSupply", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "type": "function" }, { "constant": false, "inputs": [{ "name": "_recipient", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "createIlliquidToken", "outputs": [{ "name": "o_success", "type": "bool" }], "payable": false, "type": "function" }, { "constant": false, "inputs": [{ "name": "_from", "type": "address" }, { "name": "_recipient", "type": "address" }, { "name": "_amount", "type": "uint256" }], "name": "transferFrom", "outputs": [{ "name": "o_success", "type": "bool" }], "payable": false, "type": "function" }, { "constant": true, "inputs": [], "name": "endMintingTime", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "type": "function" }, { "constant": true, "inputs": [], "name": "decimals", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "type": "function" }, { "constant": false, "inputs": [{ "name": "_recipient", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "createToken", "outputs": [{ "name": "o_success", "type": "bool" }], "payable": false, "type": "function" }, { "constant": true, "inputs": [{ "name": "_owner", "type": "address" }], "name": "balanceOf", "outputs": [{ "name": "balance", "type": "uint256" }], "payable": false, "type": "function" }, { "constant": true, "inputs": [{ "name": "", "type": "address" }], "name": "illiquidBalance", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "type": "function" }, { "constant": true, "inputs": [], "name": "symbol", "outputs": [{ "name": "", "type": "string" }], "payable": false, "type": "function" }, { "constant": false, "inputs": [{ "name": "_recipient", "type": "address" }, { "name": "_amount", "type": "uint256" }], "name": "transfer", "outputs": [{ "name": "o_success", "type": "bool" }], "payable": false, "type": "function" }, { "constant": true, "inputs": [], "name": "LOCKOUT_PERIOD", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "type": "function" }, { "constant": true, "inputs": [{ "name": "_owner", "type": "address" }, { "name": "_spender", "type": "address" }], "name": "allowance", "outputs": [{ "name": "o_remaining", "type": "uint256" }], "payable": false, "type": "function" }, { "constant": false, "inputs": [], "name": "makeLiquid", "outputs": [], "payable": false, "type": "function" }, { "inputs": [{ "name": "_minter", "type": "address" }, { "name": "_endMintingTime", "type": "uint256" }], "payable": false, "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "_from", "type": "address" }, { "indexed": true, "name": "_recipient", "type": "address" }, { "indexed": false, "name": "_value", "type": "uint256" }], "name": "Transfer", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "_owner", "type": "address" }, { "indexed": true, "name": "_spender", "type": "address" }, { "indexed": false, "name": "_value", "type": "uint256" }], "name": "Approval", "type": "event" }];

var tokenAbi = ERC20;
var WS_PORT = 1337;
var MAX_HISTORY_ITEMS = 20;

var StatusEnum = { stopped: "stopped", running: "running", paused: "paused" };

// Optional URL overrides for custom hubs
var overrides = {
  localHub: process.env.REACT_APP_LOCAL_HUB_OVERRIDE,
  localEth: process.env.REACT_APP_LOCAL_ETH_OVERRIDE,
  rinkebyHub: process.env.REACT_APP_RINKEBY_HUB_OVERRIDE,
  rinkebyEth: process.env.REACT_APP_RINKEBY_ETH_OVERRIDE,
  ropstenHub: process.env.REACT_APP_ROPSTEN_HUB_OVERRIDE,
  ropstenEth: process.env.REACT_APP_ROPSTEN_ETH_OVERRIDE,
  mainnetHub: process.env.REACT_APP_MAINNET_HUB_OVERRIDE,
  mainnetEth: process.env.REACT_APP_MAINNET_ETH_OVERRIDE
};

var DEPOSIT_ESTIMATED_GAS = new _bn.Big("700000"); // 700k gas
//const DEPOSIT_MINIMUM_WEI = new BigNumber(Web3.utils.toWei("0.020", "ether")); // 30 FIN
var HUB_EXCHANGE_CEILING = eth.constants.WeiPerEther.mul((0, _bn.Big)(69)); // 69 TST
var CHANNEL_DEPOSIT_MAX = eth.constants.WeiPerEther.mul((0, _bn.Big)(30)); // 30 TST
var HASH_PREAMBLE = "SpankWallet authentication message:";
var LOW_BALANCE_THRESHOLD = (0, _bn.Big)(process.env.LOW_BALANCE_THRESHOLD.toString());
var MAX_GAS_PRICE = (0, _bn.Big)("20000000000"); // 20 gWei

function start() {
  var app = new App();
  app.init();
  //console.log('state:', app.state);
}

var App = function () {
  function App() {
    _classCallCheck(this, App);

    //super(props);
    this.state = {
      loadingConnext: true,
      hubUrl: null,
      tokenAddress: null,
      contractAddress: null,
      hubWalletAddress: null,
      ethprovider: null,
      tokenContract: null,
      connext: null,
      delegateSigner: null,
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
        txHash: "",
        type: "",
        reset: false
      },
      browserMinimumBalance: null,
      autopayState: StatusEnum.stopped,
      history: []
    };

    //this.networkHandler = this.networkHandler.bind(this);
  }

  // ************************************************* //
  //                     Hooks                         //
  // ************************************************* //

  _createClass(App, [{
    key: "setState",
    value: function setState(entry) {
      for (var prop in entry) {
        this.state[prop] = entry[prop];
      }
    }
  }, {
    key: "init",
    value: async function init() {

      var storeFile = "./.store";

      // Set up state
      var data;
      var fileStore;
      try {
        data = _fs2.default.readFileSync(storeFile, 'utf8');
        //console.log(data)
        fileStore = new Map(JSON.parse(data));
        //console.log('store data', fileStore)
      } catch (err) {
        console.log(err.message);
      }

      // Set up state
      var mnemonic = fileStore.get("mnemonic");
      //console.log('mnemonic', mnemonic);
      // on mount, check if you need to refund by removing maxBalance
      fileStore.delete("refunding");
      var rpc = fileStore.get("rpc-prod");
      // TODO: better way to set default provider
      // if it doesnt exist in storage
      if (!rpc) {
        rpc = "ROPSTEN"; //env === "development" ? "LOCALHOST" : "MAINNET";
        fileStore.set("rpc-prod", rpc);
      }
      // If a browser address exists, create wallet
      if (!mnemonic) {
        mnemonic = (0, _walletGen.createMnemonic)();
        var storeData = JSON.stringify([{ "mnemonic": mnemonic }]);
        //console.log(storeData)
        _fs2.default.writeFile(storeFile, storeData, function (err) {
          if (err) throw err;
          console.log('store file saved');
        });
      }

      console.log('setConnext');
      await this.setConnext(rpc, mnemonic);
      console.log('setTokencontract');
      await this.setTokenContract();

      console.log('pollConnextState');
      await this.pollConnextState();
      console.log('setBrowserWalletMinimumBalance');
      await this.setBrowserWalletMinimumBalance();
      console.log('poller');
      await this.poller();

      // Initialise authorisation
      //await this.authorizeHandler();

      // Start websockets server
      await this.startWsServer();
    }
  }, {
    key: "startWsServer",
    value: async function startWsServer() {
      var _this = this;

      var express = (0, _express2.default)();
      var server = _http2.default.Server(express);
      webSocket = (0, _socket2.default)(server);

      server.listen(WS_PORT);

      console.log("Listening on port " + WS_PORT + "...");
      // WARNING: app.listen(80) will NOT work here!

      express.get('/', function (req, res) {
        res.sendFile(__dirname + '/index.html');
      });

      webSocket.on('connection', function (socket) {
        console.log('WS connection');
        socket.emit('autopay', { is: 'connected' });
        socket.on('payment-request', async function (request) {
          console.log('payment request', request);
          var payRequest = JSON.parse(request);
          await _this.sendPayment(payRequest.to, payRequest.amount);
        });

        socket.on('status', function () {
          //console.log('received status request')
          _this.sendStatusMessage();
        });

        socket.on('pause', function () {
          console.log("pausing at client's request");
          _this.pausePaymentsAndNotify();
        });

        socket.on('release', function () {
          console.log("resuming at client's request");
          _this.resumePaymentsAndNotify();
        });
      });

      this.setState({ autopayState: StatusEnum.running });
    }
  }, {
    key: "sendStatusMessage",
    value: async function sendStatusMessage() {
      var status = {
        address: this.state.address,
        balance: this.state.channelState ? this.state.channelState.balanceTokenUser : "0",
        txHistory: this.state.history,
        hubCollateral: this.state.channelState ? this.state.channelState.balanceTokenHub : "0",
        status: this.state.autopayState
      };
      webSocket.emit('status', JSON.stringify(status));
    }

    // ************************************************* //
    //                State setters                      //
    // ************************************************* //

    // either LOCALHOST MAINNET or RINKEBY


  }, {
    key: "sendPayment",
    value: async function sendPayment(toAccount, amount) {
      // Check status
      if (this.state.autopayState !== StatusEnum.running) {
        console.log('Payment requested but autosigning is paused');
        return;
      }
      debugger;
      var balance = this.state.channelState ? this.state.channelState.balanceTokenUser : 0;
      var amtWei = Web3.utils.toWei(amount);
      var payAmount = Web3.utils.isBN(amtWei) ? amtWei : (0, _bn.Big)(amtWei);
      var bnBal = (0, _bn.Big)(balance);
      if (bnBal.lt(payAmount)) {
        console.log(" Payment declined. Requested payment amount: " + payAmount + " exceeds balance: " + balance + ".");
        return;
      }

      var payment = {
        meta: {
          purchaseId: "payment"
          // memo: "",
        },
        payments: [{
          recipient: toAccount,
          amount: {
            amountToken: amtWei,
            amountWei: "0"
          },
          type: "PT_CHANNEL"
        }]
      };

      try {
        await this.state.connext.buy(payment);
        this.addToHistory(payment);
        console.log('sendPayment done');
      } catch (err) {
        console.log(err.message);
      }

      // Evaluate new balance. See if autosigning should be paused.
      balance = this.state.channelState ? this.state.channelState.balanceTokenUser : '0';
      bnBal = (0, _bn.Big)(balance);
      if (bnBal.lte(LOW_BALANCE_THRESHOLD)) {
        this.pausePaymentsAndNotify();
      }
    }
  }, {
    key: "pausePaymentsAndNotify",
    value: function pausePaymentsAndNotify() {
      webSocket.emit('pausing', 'Temporarily pausing payments.');
      this.setState({ autopayState: StatusEnum.paused });
      this.sendStatusMessage();
    }
  }, {
    key: "resumePaymentsAndNotify",
    value: function resumePaymentsAndNotify() {
      webSocket.emit('resuming', 'Temporarily resuming payments.');
      this.setState({ autopayState: StatusEnum.running });
      this.sendStatusMessage();
    }
  }, {
    key: "checkForTopup",
    value: function checkForTopup() {
      if (this.state.autopayState === StatusEnum.paused) {
        var balance = this.state.channelState ? this.state.channelState.balanceTokenUser : 0;
        var bnBal = (0, _bn.Big)(balance);
        if (bnBal.gt(LOW_BALANCE_THRESHOLD)) {
          this.resumePaymentsAndNotify();
        }
      }
    }
  }, {
    key: "addToHistory",
    value: async function addToHistory(event) {
      var eventText = '';
      if (event.meta && event.meta.purchaseId === "payment") {
        eventText = "Payment of " + Web3.utils.fromWei(event.payments[0].amount.amountToken) + " to " + event.payments[0].recipient + ". Type: " + event.payments[0].type;
      }

      var history = this.state.history;

      if (history.length >= MAX_HISTORY_ITEMS) {
        history.pop();
      }
      history.unshift(eventText);
      this.setState({ history: history });
    }
  }, {
    key: "setTokenContract",
    value: async function setTokenContract() {
      try {
        var _state = this.state,
            customWeb3 = _state.customWeb3,
            tokenAddress = _state.tokenAddress;

        var tokenContract = new customWeb3.eth.Contract(tokenAbi, tokenAddress);
        this.setState({ tokenContract: tokenContract });
      } catch (e) {
        console.log("Error setting token contract");
        console.log(e);
      }
    }
  }, {
    key: "setConnext",
    value: async function setConnext(rpc, mnemonic) {
      console.log('setting Connext');
      var customWeb3 = this.state.customWeb3;


      var rpcUrl = void 0,
          hubUrl = void 0;
      var ethprovider = void 0;
      switch (rpc) {
        case "LOCALHOST":
          hubUrl = overrides.localHub || publicUrl + "/api/local/hub";
          ethprovider = new eth.providers.JsonRpcProvider("http://localhost:8545");
          break;
        case "RINKEBY":
          hubUrl = overrides.rinkebyHub || publicUrl + "/api/rinkeby/hub";
          ethprovider = new eth.getDefaultProvider("rinkeby");
          break;
        case "ROPSTEN":
          var _rpcUrl = overrides.ropstenEth || publicUrl + "/api/ropsten/eth";
          ethprovider = new eth.providers.JsonRpcProvider(_rpcUrl);
          //ethprovider = new eth.getDefaultProvider("ropsten");
          hubUrl = overrides.ropstenHub || publicUrl + "/api/ropsten/hub";
          break;
        case "MAINNET":
          hubUrl = overrides.mainnetHub || publicUrl + "/api/mainnet/hub";
          ethprovider = new eth.getDefaultProvider();
          break;
        default:
          throw new Error("Unrecognized rpc: " + rpc);
      }
      console.log('hubUrl', hubUrl);

      //const providerOpts = new ProviderOptions(store, rpcUrl, hubUrl).approving();
      //const provider = clientProvider(providerOpts);
      //const customWeb3 = new Web3(provider);
      //const customId = await customWeb3.eth.net.getId();
      // NOTE: token/contract/hubWallet ddresses are set to state while initializing connext

      console.log('saving state...');
      //TODO - no state
      //this.setState({ customWeb3, hubUrl, rpcUrl });
      this.setState({
        'customWeb3': customWeb3,
        'hubUrl': hubUrl,
        'rpcUrl': rpcUrl
      });

      var opts = {
        //web3: customWeb3,
        hubUrl: hubUrl, // in dev-mode: http://localhost:8080,
        //user: address,
        //origin: "localhost", // TODO: what should this be
        mnemonic: mnemonic
      };

      // *** Instantiate the connext client ***
      console.log('getting Connext client');
      try {
        var connext = await (0, _dist.getConnextClient)(opts);
        var address = await connext.wallet.getAddress();
        console.log("Successfully set up connext! Connext config:");
        console.log("  - tokenAddress: " + connext.opts.tokenAddress);
        console.log("  - hubAddress: " + connext.opts.hubAddress);
        console.log("  - contractAddress: " + connext.opts.contractAddress);
        console.log("  - ethNetworkId: " + connext.opts.ethNetworkId);
        console.log("  - public address: " + address);
        this.setState({
          connext: connext,
          tokenAddress: connext.opts.tokenAddress,
          channelManagerAddress: connext.opts.contractAddress,
          hubWalletAddress: connext.opts.hubAddress,
          ethNetworkId: connext.opts.ethNetworkId,
          address: address,
          ethprovider: ethprovider
        });
      } catch (err) {
        console.log(err.message);
      }
    }
  }, {
    key: "setTokenContract",
    value: async function setTokenContract() {
      try {
        var _state2 = this.state,
            tokenAddress = _state2.tokenAddress,
            ethprovider = _state2.ethprovider;

        var tokenContract = new eth.Contract(tokenAddress, tokenAbi, ethprovider);
        this.setState({ tokenContract: tokenContract });
      } catch (e) {
        console.log("Error setting token contract");
        console.log(e);
      }
    }

    // ************************************************* //
    //                    Pollers                        //
    // ************************************************* //

  }, {
    key: "pollConnextState",
    value: async function pollConnextState() {
      var _this2 = this;

      var connext = this.state.connext;
      // register connext listeners
      connext.on("onStateChange", function (state) {
        _this2.setState({
          channelState: state.persistent.channel,
          connextState: state,
          runtime: state.runtime,
          exchangeRate: state.runtime.exchangeRate ? state.runtime.exchangeRate.rates.USD : 0
        });
        // Check whether, if autosigning is paused, the balance has been topped up sufficiently.
        _this2.checkForTopup();
      });
      // start polling
      await connext.start();
      console.log('connext loaded');
      this.setState({ loadingConnext: false });
    }
  }, {
    key: "poller",
    value: async function poller() {
      var _this3 = this;

      await this.autoDeposit();
      await this.autoSwap();

      (0, _intervalPromise2.default)(async function (iteration, stop) {
        await _this3.autoDeposit();
      }, 5000);

      //TODO - this is not in card. remove it?
      (0, _intervalPromise2.default)(async function (iteration, stop) {
        await _this3.getCustodialBalance();
      }, 5000);
    }
  }, {
    key: "setBrowserWalletMinimumBalance",
    value: async function setBrowserWalletMinimumBalance() {
      var _state3 = this.state,
          connextState = _state3.connextState,
          ethprovider = _state3.ethprovider;
      // let gasEstimateJson = await eth.utils.fetchJson({ url: `https://ethgasstation.info/json/ethgasAPI.json` });

      var providerGasPrice = await ethprovider.getGasPrice();
      // let currentGasPrice = Math.round((gasEstimateJson.average / 10) * 2); // multiply gas price by two to be safe
      // dont let gas price be any higher than the max
      // currentGasPrice = eth.utils.parseUnits(minBN(Big(currentGasPrice.toString()), MAX_GAS_PRICE).toString(), "gwei");
      // unless it really needs to be: average eth gas station price w ethprovider's
      // currentGasPrice = currentGasPrice.add(providerGasPrice).div(eth.constants.Two);

      providerGasPrice = MAX_GAS_PRICE; // hardcode for now
      console.log("Gas Price = " + providerGasPrice);

      // default connext multiple is 1.5, leave 2x for safety
      var totalDepositGasWei = DEPOSIT_ESTIMATED_GAS.mul((0, _bn.Big)(2)).mul(providerGasPrice);

      // add dai conversion
      var minConvertable = new CurrencyConvertable(CurrencyType.WEI, totalDepositGasWei, function () {
        return getExchangeRates(connextState);
      });
      var browserMinimumBalance = {
        wei: minConvertable.toWEI().amount,
        dai: minConvertable.toUSD().amount
      };
      this.setState({ browserMinimumBalance: browserMinimumBalance });
      return browserMinimumBalance;
    }
  }, {
    key: "autoDeposit",
    value: async function autoDeposit() {
      var _state4 = this.state,
          address = _state4.address,
          tokenContract = _state4.tokenContract,
          connextState = _state4.connextState,
          tokenAddress = _state4.tokenAddress,
          connext = _state4.connext,
          browserMinimumBalance = _state4.browserMinimumBalance,
          ethprovider = _state4.ethprovider;


      if (!connext || !browserMinimumBalance) return;

      var balance = await ethprovider.getBalance(address);

      var tokenBalance = "0";
      try {
        tokenBalance = await tokenContract.balanceOf(address);
      } catch (e) {
        console.warn("Error fetching token balance, are you sure the token address (addr: " + tokenAddress + ") is correct for the selected network (id: " + JSON.stringify((await ethprovider.getNetwork())) + "))? Error: " + e.message);
        return;
      }

      if (balance.gt(eth.constants.Zero) || tokenBalance.gt(eth.constants.Zero)) {
        var minWei = (0, _bn.Big)(browserMinimumBalance.wei);
        if (balance.lt(minWei)) {
          // don't autodeposit anything under the threshold
          // update the refunding variable before returning
          // We hit this repeatedly after first deposit & we have dust left over
          // No need to clutter logs w the below
          // console.log(`Current balance is ${balance.toString()}, less than minBalance of ${minWei.toString()}`);
          return;
        }
        // only proceed with deposit request if you can deposit
        if (!connextState) {
          return;
        }
        if (
        // something was submitted
        connextState.runtime.deposit.submitted || connextState.runtime.withdrawal.submitted || connextState.runtime.collateral.submitted) {
          console.log("Deposit or withdrawal transaction in progress, will not auto-deposit");
          return;
        }

        var channelDeposit = {
          amountWei: balance.sub(minWei),
          amountToken: tokenBalance
        };

        if (channelDeposit.amountWei.eq(eth.constants.Zero) && channelDeposit.amountToken.eq(eth.constants.Zero)) {
          return;
        }

        await this.state.connext.deposit({
          amountWei: channelDeposit.amountWei.toString(),
          amountToken: channelDeposit.amountToken.toString()
        });
      }
    }
  }, {
    key: "autoSwap",
    value: async function autoSwap() {
      var _state5 = this.state,
          channelState = _state5.channelState,
          connextState = _state5.connextState;

      if (!connextState || hasPendingOps(channelState)) {
        return;
      }
      var weiBalance = (0, _bn.Big)(channelState.balanceWeiUser);
      var tokenBalance = (0, _bn.Big)(channelState.balanceTokenUser);
      if (channelState && weiBalance.gt((0, _bn.Big)("0")) && tokenBalance.lte(HUB_EXCHANGE_CEILING)) {
        await this.state.connext.exchange(channelState.balanceWeiUser, "wei");
      }
    }
  }, {
    key: "getCustodialBalance",
    value: async function getCustodialBalance() {
      var _state6 = this.state,
          hubUrl = _state6.hubUrl,
          address = _state6.address,
          customWeb3 = _state6.customWeb3;

      var opts = {
        web3: customWeb3,
        hubUrl: hubUrl, // in dev-mode: http://localhost:8080,
        user: address,
        origin: "localhost", // TODO: what should this be
        cookie: document.cookie
      };

      try {
        //const custodialBalance = await axios.get(`${hubUrl}/channel/${address}/sync?lastChanTx=27&lastThreadUpdateId=0`, opts);
        //const custodialBalance = await axios.get(`${hubUrl}/custodial/${address}/balance`, opts);
        //console.log('custodial balance ', custodialBalance)
      } catch (err) {
        console.log(err.message);
      }
    }

    // ************************************************* //
    //                    Handlers                       //
    // ************************************************* //

  }, {
    key: "updateApprovalHandler",
    value: function updateApprovalHandler(evt) {
      this.setState({
        approvalWeiUser: evt.target.value
      });
    }
  }]);

  return App;
}();

exports.default = App;