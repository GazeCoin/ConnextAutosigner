"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const events_1 = require("events");
const redux_1 = require("redux");
const web3_1 = __importDefault(require("web3"));
const ChannelManager_1 = require("./contract/ChannelManager");
const BuyController_1 = __importDefault(require("./controllers/BuyController"));
const CollateralController_1 = __importDefault(require("./controllers/CollateralController"));
const DepositController_1 = __importDefault(require("./controllers/DepositController"));
const ExchangeController_1 = require("./controllers/ExchangeController");
const RedeemController_1 = require("./controllers/RedeemController");
const StateUpdateController_1 = __importDefault(require("./controllers/StateUpdateController"));
const SyncController_1 = __importDefault(require("./controllers/SyncController"));
const ThreadsController_1 = __importDefault(require("./controllers/ThreadsController"));
const WithdrawalController_1 = __importDefault(require("./controllers/WithdrawalController"));
const Hub_1 = require("./Hub");
const networking_1 = require("./lib/networking");
const utils_1 = require("./lib/utils");
const actions = __importStar(require("./state/actions"));
const middleware_1 = require("./state/middleware");
const reducers_1 = require("./state/reducers");
const store_1 = require("./state/store");
const types_1 = require("./types");
const Utils_1 = require("./Utils");
const validator_1 = require("./validator");
const Wallet_1 = __importDefault(require("./Wallet"));
////////////////////////////////////////
// Implementations
////////////////////////////////////////
// Used to get an instance of ConnextClient.
function getConnextClient(opts) {
    return __awaiter(this, void 0, void 0, function* () {
        const hubConfig = (yield (new networking_1.Networking(opts.hubUrl)).get(`config`)).data;
        const config = {
            contractAddress: hubConfig.channelManagerAddress.toLowerCase(),
            ethNetworkId: hubConfig.ethNetworkId.toLowerCase(),
            hubAddress: hubConfig.hubWalletAddress.toLowerCase(),
            tokenAddress: hubConfig.tokenAddress.toLowerCase(),
        };
        const merged = Object.assign({}, opts);
        for (const k in config) {
            if (opts[k]) {
                continue;
            }
            merged[k] = config[k];
        }
        // if web3, create a new web3 
        if (merged.web3Provider && !merged.user) {
            // set default address
            // TODO: improve this
            const tmp = new web3_1.default(opts.web3Provider);
            merged.user = (yield tmp.eth.getAccounts())[0];
        }
        const wallet = new Wallet_1.default(merged);
        merged.user = merged.user || wallet.address;
        return new ConnextInternal(Object.assign({}, merged), wallet);
    });
}
exports.getConnextClient = getConnextClient;
/**
 * The external interface to the Connext client, used by the Wallet.
 *
 * Create an instance with:
 *
 *  > const client = getConnextClient({...})
 *  > client.start() // start polling
 *  > client.on('onStateChange', state => {
 *  .   console.log('Connext state changed:', state)
 *  . })
 *
 */
class ConnextClient extends events_1.EventEmitter {
    constructor(opts) {
        super();
        this.opts = opts;
        this.utils = new Utils_1.Utils();
        this.internal = this;
    }
    // ******************************
    // ******* POLLING METHODS ******
    // ******************************
    // Starts the stateful portions of the Connext client.
    start() {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    // Stops the stateful portions of the Connext client.
    stop() {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    // Stops all pollers, and restarts them with provided time period.
    setPollInterval(ms) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    // ******************************
    // ******* PROFILE METHODS ******
    // ******************************
    getProfileConfig() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.internal.hub.getProfileConfig();
        });
    }
    startProfileSession() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.internal.hub.startProfileSession();
        });
    }
    // ******************************
    // **** CORE CHANNEL METHODS ****
    // ******************************
    buy(purchase) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.internal.buyController.buy(purchase);
        });
    }
    deposit(payment) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.internal.depositController.requestUserDeposit(payment);
        });
    }
    exchange(toSell, currency) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.internal.exchangeController.exchange(toSell, currency);
        });
    }
    recipientNeedsCollateral(recipient, amount) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.internal.recipientNeedsCollateral(recipient, amount);
        });
    }
    withdraw(withdrawal) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.internal.withdrawalController.requestUserWithdrawal(withdrawal);
        });
    }
    requestCollateral() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.internal.collateralController.requestCollateral();
        });
    }
    redeem(secret) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.internal.redeemController.redeem(secret);
        });
    }
    getPaymentHistory() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.internal.hub.getPaymentHistory();
        });
    }
    getPaymentById(purchaseId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.internal.hub.getPaymentById(purchaseId);
        });
    }
}
exports.ConnextClient = ConnextClient;
/**
 * The "actual" implementation of the Connext client. Internal components
 * should use this type, as it provides access to the various controllers, etc.
 */
class ConnextInternal extends ConnextClient {
    constructor(opts, wallet) {
        super(opts);
        this._latestState = null;
        this._saving = Promise.resolve();
        this._savePending = false;
        this.opts = opts;
        // Internal things
        // The store shouldn't be used by anything before calling `start()`, so
        // leave it null until then.
        this.store = null;
        this.wallet = wallet;
        this.provider = wallet.provider;
        this.opts.origin = opts.origin || 'unknown';
        console.log('Using hub', opts.hub ? 'provided by caller' : `at ${this.opts.hubUrl}`);
        this.hub = opts.hub || new Hub_1.HubAPIClient(new networking_1.Networking(this.opts.hubUrl), this.opts.origin, this.wallet);
        opts.user = opts.user.toLowerCase();
        opts.hubAddress = opts.hubAddress.toLowerCase();
        opts.contractAddress = opts.contractAddress.toLowerCase();
        opts.gasMultiple = opts.gasMultiple || 1.5;
        this.contract = opts.contract
            || new ChannelManager_1.ChannelManager(wallet, opts.contractAddress, opts.gasMultiple);
        this.validator = new validator_1.Validator(opts.hubAddress, this.provider, this.contract.rawAbi);
        this.utils = new Utils_1.Utils();
        // Controllers
        this.exchangeController = new ExchangeController_1.ExchangeController('ExchangeController', this);
        this.syncController = new SyncController_1.default('SyncController', this);
        this.depositController = new DepositController_1.default('DepositController', this);
        this.buyController = new BuyController_1.default('BuyController', this);
        this.withdrawalController = new WithdrawalController_1.default('WithdrawalController', this);
        this.stateUpdateController = new StateUpdateController_1.default('StateUpdateController', this);
        this.collateralController = new CollateralController_1.default('CollateralController', this);
        this.threadsController = new ThreadsController_1.default('ThreadsController', this);
        this.redeemController = new RedeemController_1.RedeemController('RedeemController', this);
    }
    ////////////////////////////////////////
    // Begin Public Method Implementations
    // TODO:
    //  - must stop all pollers, and restart them with the given
    //    polling interval
    //      - pollers must accept this as an outside parameter
    //  - this will also impact payment times, there is a potential
    //    need to dynamically reset polling when a certain update
    //    time is detected for UX. However, it may be best to leave
    //    this up to the implementers to toggle.
    setPollInterval(ms) {
        return __awaiter(this, void 0, void 0, function* () {
            console.warn('This function has not been implemented yet');
        });
    }
    withdrawal(params) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.withdrawalController.requestUserWithdrawal(params);
        });
    }
    recipientNeedsCollateral(recipient, amount) {
        return __awaiter(this, void 0, void 0, function* () {
            // get recipients channel
            let channel;
            try {
                channel = yield this.hub.getChannelByUser(recipient);
            }
            catch (e) {
                if (e.status === 404) {
                    return `Recipient channel does not exist. Recipient: ${recipient}.`;
                }
                throw e;
            }
            // check if hub can afford payment
            const chanBN = types_1.convertChannelState('bn', channel.state);
            const amtBN = types_1.convertPayment('bn', amount);
            if (chanBN.balanceWeiHub.lt(amtBN.amountWei) || chanBN.balanceTokenHub.lt(amtBN.amountToken)) {
                return 'Recipient needs collateral to facilitate payment.';
            }
            // otherwise, no collateral is needed to make payment
            return null;
        });
    }
    start() {
        const _super = Object.create(null, {
            start: { get: () => super.start }
        });
        return __awaiter(this, void 0, void 0, function* () {
            this.store = yield this.getStore();
            this.store.subscribe(() => __awaiter(this, void 0, void 0, function* () {
                const state = this.store.getState();
                this.emit('onStateChange', state);
                yield this._saveState(state);
            }));
            // before starting controllers, sync values
            const syncedOpts = yield this.syncConfig();
            this.store.dispatch(actions.setHubAddress(syncedOpts.hubAddress));
            // auth is handled on each endpoint posting via the Hub API Client
            // get any custodial balances
            const custodialBalance = yield this.hub.getCustodialBalance();
            if (custodialBalance) {
                this.store.dispatch(actions.setCustodialBalance(custodialBalance));
            }
            // TODO: appropriately set the latest
            // valid state ??
            const channelAndUpdate = yield this.hub.getLatestChannelStateAndUpdate();
            if (channelAndUpdate) {
                this.store.dispatch(actions.setChannelAndUpdate(channelAndUpdate));
                // update the latest valid state
                const latestValid = yield this.hub.getLatestStateNoPendingOps();
                if (latestValid) {
                    this.store.dispatch(actions.setLatestValidState(latestValid));
                }
                // unconditionally update last thread update id, thread history
                const lastThreadUpdateId = yield this.hub.getLastThreadUpdateId();
                this.store.dispatch(actions.setLastThreadUpdateId(lastThreadUpdateId));
                // extract thread history, sort by descending threadId
                const threadHistoryDuplicates = (yield this.hub.getAllThreads()).map((t) => {
                    return {
                        receiver: t.receiver,
                        sender: t.sender,
                        threadId: t.threadId,
                    };
                }).sort((a, b) => b.threadId - a.threadId);
                // filter duplicates
                const threadHistory = threadHistoryDuplicates.filter((thread, i) => {
                    const search = JSON.stringify({
                        receiver: thread.receiver,
                        sender: thread.sender,
                    });
                    const elts = threadHistoryDuplicates.map((t) => {
                        return JSON.stringify({ sender: t.sender, receiver: t.receiver });
                    });
                    return elts.indexOf(search) === i;
                });
                this.store.dispatch(actions.setThreadHistory(threadHistory));
                // if thread count is greater than 0, update
                // activeThreads, initial states
                if (channelAndUpdate.state.threadCount > 0) {
                    const initialStates = yield this.hub.getThreadInitialStates();
                    this.store.dispatch(actions.setActiveInitialThreadStates(initialStates));
                    const threadRows = yield this.hub.getActiveThreads();
                    this.store.dispatch(actions.setActiveThreads(threadRows));
                }
            }
            // Start all controllers
            for (const controller of this.getControllers()) {
                console.log('Starting:', controller.name);
                yield controller.start();
                console.log('Done!', controller.name, 'started.');
            }
            yield _super.start.call(this);
        });
    }
    stop() {
        const _super = Object.create(null, {
            stop: { get: () => super.stop }
        });
        return __awaiter(this, void 0, void 0, function* () {
            // Stop all controllers
            for (const controller of this.getControllers()) {
                yield controller.stop();
            }
            yield _super.stop.call(this);
        });
    }
    generateSecret() {
        return ethers_1.ethers.utils.solidityKeccak256(['bytes32'], [ethers_1.ethers.utils.randomBytes(32)]);
    }
    getContractEvents(eventName, fromBlock) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.contract.getPastEvents(eventName, [this.opts.user], fromBlock);
        });
    }
    signChannelState(state) {
        return __awaiter(this, void 0, void 0, function* () {
            if (state.user.toLowerCase() !== this.opts.user.toLowerCase() ||
                state.contractAddress.toLowerCase() !== this.opts.contractAddress.toLowerCase()) {
                throw new Error(`Refusing to sign channel state update which changes user or contract: ` +
                    `expected user: ${this.opts.user}, expected contract: ${this.opts.contractAddress} ` +
                    `actual state: ${JSON.stringify(state)}`);
            }
            const hash = this.utils.createChannelStateHash(state);
            const { user, hubAddress } = this.opts;
            const sig = yield this.wallet.signMessage(hash);
            return types_1.addSigToChannelState(state, sig, true);
        });
    }
    signThreadState(state) {
        return __awaiter(this, void 0, void 0, function* () {
            const userInThread = state.sender === this.opts.user || state.receiver === this.opts.user;
            if (!userInThread ||
                state.contractAddress !== this.opts.contractAddress) {
                throw new Error(`Refusing to sign thread state update which changes user or contract: ` +
                    `expected user: ${this.opts.user}, expected contract: ${this.opts.contractAddress} ` +
                    `actual state: ${JSON.stringify(state)}`);
            }
            const hash = this.utils.createThreadStateHash(state);
            const sig = yield this.wallet.signMessage(hash);
            console.log(`Signing thread state ${state.txCount}: ${sig}`, state);
            return types_1.addSigToThreadState(state, sig);
        });
    }
    signDepositRequestProposal(args) {
        return __awaiter(this, void 0, void 0, function* () {
            const hash = this.utils.createDepositRequestProposalHash(args);
            const sig = yield this.wallet.signMessage(hash);
            console.log(`Signing deposit request ${JSON.stringify(args, null, 2)}. Sig: ${sig}`);
            return Object.assign({}, args, { sigUser: sig });
        });
    }
    /**
     * Waits for any persistent state to be saved.
     * If the save fails, the promise will reject.
     */
    awaitPersistentStateSaved() {
        return this._saving;
    }
    ////////////////////////////////////////
    // Begin Public Method Implementations
    _saveState(state) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.opts.saveState) {
                return;
            }
            if (this._latestState === state.persistent) {
                return;
            }
            this._latestState = state.persistent;
            if (this._savePending) {
                return;
            }
            this._savePending = true;
            this._saving = new Promise((res, rej) => {
                // Only save the state after all the currently pending operations have
                // completed to make sure that subsequent state updates will be atomic.
                setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                    let err = null;
                    try {
                        yield this._saveLoop();
                    }
                    catch (e) {
                        err = e;
                    }
                    // Be sure to set `_savePending` to `false` before resolve/reject
                    // in case the state changes during res()/rej()
                    this._savePending = false;
                    return err ? rej(err) : res();
                }), 1);
            });
        });
    }
    /**
     * Because it's possible that the state will continue to be updated while
     * a previous state is saving, loop until the state doesn't change while
     * it's being saved before we return.
     */
    _saveLoop() {
        return __awaiter(this, void 0, void 0, function* () {
            let result = null;
            while (true) {
                const state = this._latestState;
                result = this.opts.saveState(JSON.stringify(state));
                // Wait for any current save to finish, but ignore any error it might raise
                const [timeout, _] = yield utils_1.timeoutPromise(result.then(null, () => null), 10 * 1000);
                if (timeout) {
                    console.warn('Timeout (10 seconds) while waiting for state to save. ' +
                        'This error will be ignored (which may cause data loss). ' +
                        'User supplied function that has not returned:', this.opts.saveState);
                }
                if (this._latestState === state) {
                    break;
                }
            }
        });
    }
    dispatch(action) {
        this.store.dispatch(action);
    }
    syncConfig() {
        return __awaiter(this, void 0, void 0, function* () {
            const config = yield this.hub.config();
            const adjusted = {};
            Object.keys(this.opts).map((k) => {
                if (k || Object.keys(this.opts).indexOf(k) !== -1) {
                    // user supplied, igonore
                    adjusted[k] = this.opts[k];
                    return;
                }
                adjusted[k] = config[k];
            });
            return adjusted;
        });
    }
    getControllers() {
        const res = [];
        for (const key of Object.keys(this)) {
            const val = this[key];
            const isController = (val &&
                utils_1.isFunction(val.start) &&
                utils_1.isFunction(val.stop) &&
                val !== this);
            if (isController)
                res.push(val);
        }
        return res;
    }
    getStore() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.opts.store) {
                return this.opts.store;
            }
            const state = new store_1.ConnextState();
            state.persistent.channel = Object.assign({}, state.persistent.channel, { contractAddress: this.opts.contractAddress || '', recipient: this.opts.user, user: this.opts.user });
            state.persistent.latestValidState = state.persistent.channel;
            if (this.opts.loadState) {
                const loadedState = yield this.opts.loadState();
                if (loadedState) {
                    state.persistent = JSON.parse(loadedState);
                }
            }
            return redux_1.createStore(reducers_1.reducers, state, redux_1.applyMiddleware(middleware_1.handleStateFlags));
        });
    }
}
exports.ConnextInternal = ConnextInternal;
//# sourceMappingURL=Connext.js.map