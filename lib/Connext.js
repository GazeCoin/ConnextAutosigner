"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var __awaiter = undefined && undefined.__awaiter || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) {
            try {
                step(generator.next(value));
            } catch (e) {
                reject(e);
            }
        }
        function rejected(value) {
            try {
                step(generator["throw"](value));
            } catch (e) {
                reject(e);
            }
        }
        function step(result) {
            result.done ? resolve(result.value) : new P(function (resolve) {
                resolve(result.value);
            }).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = undefined && undefined.__importDefault || function (mod) {
    return mod && mod.__esModule ? mod : { "default": mod };
};
var __importStar = undefined && undefined.__importStar || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) {
        if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    }result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var ethers_1 = require("ethers");
var events_1 = require("events");
var redux_1 = require("redux");
var web3_1 = __importDefault(require("web3"));
var ChannelManager_1 = require("./contract/ChannelManager");
var BuyController_1 = __importDefault(require("./controllers/BuyController"));
var CollateralController_1 = __importDefault(require("./controllers/CollateralController"));
var DepositController_1 = __importDefault(require("./controllers/DepositController"));
var ExchangeController_1 = require("./controllers/ExchangeController");
var RedeemController_1 = require("./controllers/RedeemController");
var StateUpdateController_1 = __importDefault(require("./controllers/StateUpdateController"));
var SyncController_1 = __importDefault(require("./controllers/SyncController"));
var ThreadsController_1 = __importDefault(require("./controllers/ThreadsController"));
var WithdrawalController_1 = __importDefault(require("./controllers/WithdrawalController"));
var Hub_1 = require("./Hub");
var networking_1 = require("./lib/networking");
var utils_1 = require("./lib/utils");
var actions = __importStar(require("./state/actions"));
var middleware_1 = require("./state/middleware");
var reducers_1 = require("./state/reducers");
var store_1 = require("./state/store");
var types_1 = require("./types");
var Utils_1 = require("./Utils");
var validator_1 = require("./validator");
var Wallet_1 = __importDefault(require("./Wallet"));
////////////////////////////////////////
// Implementations
////////////////////////////////////////
// Used to get an instance of ConnextClient.
function getConnextClient(opts) {
    return __awaiter(this, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        var hubConfig, config, merged, k, tmp, wallet;
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.next = 2;
                        return new networking_1.Networking(opts.hubUrl).get("config");

                    case 2:
                        hubConfig = _context.sent.data;
                        config = {
                            contractAddress: hubConfig.channelManagerAddress.toLowerCase(),
                            ethNetworkId: hubConfig.ethNetworkId.toLowerCase(),
                            hubAddress: hubConfig.hubWalletAddress.toLowerCase(),
                            tokenAddress: hubConfig.tokenAddress.toLowerCase()
                        };
                        merged = Object.assign({}, opts);
                        _context.t0 = regeneratorRuntime.keys(config);

                    case 6:
                        if ((_context.t1 = _context.t0()).done) {
                            _context.next = 13;
                            break;
                        }

                        k = _context.t1.value;

                        if (!opts[k]) {
                            _context.next = 10;
                            break;
                        }

                        return _context.abrupt("continue", 6);

                    case 10:
                        merged[k] = config[k];
                        _context.next = 6;
                        break;

                    case 13:
                        if (!(merged.web3Provider && !merged.user)) {
                            _context.next = 18;
                            break;
                        }

                        // set default address
                        // TODO: improve this
                        tmp = new web3_1.default(opts.web3Provider);
                        _context.next = 17;
                        return tmp.eth.getAccounts();

                    case 17:
                        merged.user = _context.sent[0];

                    case 18:
                        wallet = new Wallet_1.default(merged);

                        merged.user = merged.user || wallet.address;
                        return _context.abrupt("return", new ConnextInternal(Object.assign({}, merged), wallet));

                    case 21:
                    case "end":
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));
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

var ConnextClient = function (_events_1$EventEmitte) {
    _inherits(ConnextClient, _events_1$EventEmitte);

    function ConnextClient(opts) {
        _classCallCheck(this, ConnextClient);

        var _this = _possibleConstructorReturn(this, (ConnextClient.__proto__ || Object.getPrototypeOf(ConnextClient)).call(this));

        _this.opts = opts;
        _this.utils = new Utils_1.Utils();
        _this.internal = _this;
        return _this;
    }
    // ******************************
    // ******* POLLING METHODS ******
    // ******************************
    // Starts the stateful portions of the Connext client.


    _createClass(ConnextClient, [{
        key: "start",
        value: function start() {
            return __awaiter(this, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                            case "end":
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));
        }
        // Stops the stateful portions of the Connext client.

    }, {
        key: "stop",
        value: function stop() {
            return __awaiter(this, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
                return regeneratorRuntime.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                            case "end":
                                return _context3.stop();
                        }
                    }
                }, _callee3, this);
            }));
        }
        // Stops all pollers, and restarts them with provided time period.

    }, {
        key: "setPollInterval",
        value: function setPollInterval(ms) {
            return __awaiter(this, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
                return regeneratorRuntime.wrap(function _callee4$(_context4) {
                    while (1) {
                        switch (_context4.prev = _context4.next) {
                            case 0:
                            case "end":
                                return _context4.stop();
                        }
                    }
                }, _callee4, this);
            }));
        }
        // ******************************
        // ******* PROFILE METHODS ******
        // ******************************

    }, {
        key: "getProfileConfig",
        value: function getProfileConfig() {
            return __awaiter(this, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
                return regeneratorRuntime.wrap(function _callee5$(_context5) {
                    while (1) {
                        switch (_context5.prev = _context5.next) {
                            case 0:
                                _context5.next = 2;
                                return this.internal.hub.getProfileConfig();

                            case 2:
                                return _context5.abrupt("return", _context5.sent);

                            case 3:
                            case "end":
                                return _context5.stop();
                        }
                    }
                }, _callee5, this);
            }));
        }
    }, {
        key: "startProfileSession",
        value: function startProfileSession() {
            return __awaiter(this, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee6() {
                return regeneratorRuntime.wrap(function _callee6$(_context6) {
                    while (1) {
                        switch (_context6.prev = _context6.next) {
                            case 0:
                                _context6.next = 2;
                                return this.internal.hub.startProfileSession();

                            case 2:
                            case "end":
                                return _context6.stop();
                        }
                    }
                }, _callee6, this);
            }));
        }
        // ******************************
        // **** CORE CHANNEL METHODS ****
        // ******************************

    }, {
        key: "buy",
        value: function buy(purchase) {
            return __awaiter(this, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee7() {
                return regeneratorRuntime.wrap(function _callee7$(_context7) {
                    while (1) {
                        switch (_context7.prev = _context7.next) {
                            case 0:
                                _context7.next = 2;
                                return this.internal.buyController.buy(purchase);

                            case 2:
                                return _context7.abrupt("return", _context7.sent);

                            case 3:
                            case "end":
                                return _context7.stop();
                        }
                    }
                }, _callee7, this);
            }));
        }
    }, {
        key: "deposit",
        value: function deposit(payment) {
            return __awaiter(this, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee8() {
                return regeneratorRuntime.wrap(function _callee8$(_context8) {
                    while (1) {
                        switch (_context8.prev = _context8.next) {
                            case 0:
                                _context8.next = 2;
                                return this.internal.depositController.requestUserDeposit(payment);

                            case 2:
                            case "end":
                                return _context8.stop();
                        }
                    }
                }, _callee8, this);
            }));
        }
    }, {
        key: "exchange",
        value: function exchange(toSell, currency) {
            return __awaiter(this, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee9() {
                return regeneratorRuntime.wrap(function _callee9$(_context9) {
                    while (1) {
                        switch (_context9.prev = _context9.next) {
                            case 0:
                                _context9.next = 2;
                                return this.internal.exchangeController.exchange(toSell, currency);

                            case 2:
                            case "end":
                                return _context9.stop();
                        }
                    }
                }, _callee9, this);
            }));
        }
    }, {
        key: "recipientNeedsCollateral",
        value: function recipientNeedsCollateral(recipient, amount) {
            return __awaiter(this, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee10() {
                return regeneratorRuntime.wrap(function _callee10$(_context10) {
                    while (1) {
                        switch (_context10.prev = _context10.next) {
                            case 0:
                                _context10.next = 2;
                                return this.internal.recipientNeedsCollateral(recipient, amount);

                            case 2:
                                return _context10.abrupt("return", _context10.sent);

                            case 3:
                            case "end":
                                return _context10.stop();
                        }
                    }
                }, _callee10, this);
            }));
        }
    }, {
        key: "withdraw",
        value: function withdraw(withdrawal) {
            return __awaiter(this, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee11() {
                return regeneratorRuntime.wrap(function _callee11$(_context11) {
                    while (1) {
                        switch (_context11.prev = _context11.next) {
                            case 0:
                                _context11.next = 2;
                                return this.internal.withdrawalController.requestUserWithdrawal(withdrawal);

                            case 2:
                            case "end":
                                return _context11.stop();
                        }
                    }
                }, _callee11, this);
            }));
        }
    }, {
        key: "requestCollateral",
        value: function requestCollateral() {
            return __awaiter(this, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee12() {
                return regeneratorRuntime.wrap(function _callee12$(_context12) {
                    while (1) {
                        switch (_context12.prev = _context12.next) {
                            case 0:
                                _context12.next = 2;
                                return this.internal.collateralController.requestCollateral();

                            case 2:
                            case "end":
                                return _context12.stop();
                        }
                    }
                }, _callee12, this);
            }));
        }
    }, {
        key: "redeem",
        value: function redeem(secret) {
            return __awaiter(this, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee13() {
                return regeneratorRuntime.wrap(function _callee13$(_context13) {
                    while (1) {
                        switch (_context13.prev = _context13.next) {
                            case 0:
                                _context13.next = 2;
                                return this.internal.redeemController.redeem(secret);

                            case 2:
                                return _context13.abrupt("return", _context13.sent);

                            case 3:
                            case "end":
                                return _context13.stop();
                        }
                    }
                }, _callee13, this);
            }));
        }
    }, {
        key: "getPaymentHistory",
        value: function getPaymentHistory() {
            return __awaiter(this, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee14() {
                return regeneratorRuntime.wrap(function _callee14$(_context14) {
                    while (1) {
                        switch (_context14.prev = _context14.next) {
                            case 0:
                                _context14.next = 2;
                                return this.internal.hub.getPaymentHistory();

                            case 2:
                                return _context14.abrupt("return", _context14.sent);

                            case 3:
                            case "end":
                                return _context14.stop();
                        }
                    }
                }, _callee14, this);
            }));
        }
    }, {
        key: "getPaymentById",
        value: function getPaymentById(purchaseId) {
            return __awaiter(this, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee15() {
                return regeneratorRuntime.wrap(function _callee15$(_context15) {
                    while (1) {
                        switch (_context15.prev = _context15.next) {
                            case 0:
                                _context15.next = 2;
                                return this.internal.hub.getPaymentById(purchaseId);

                            case 2:
                                return _context15.abrupt("return", _context15.sent);

                            case 3:
                            case "end":
                                return _context15.stop();
                        }
                    }
                }, _callee15, this);
            }));
        }
    }]);

    return ConnextClient;
}(events_1.EventEmitter);

exports.ConnextClient = ConnextClient;
/**
 * The "actual" implementation of the Connext client. Internal components
 * should use this type, as it provides access to the various controllers, etc.
 */

var ConnextInternal = function (_ConnextClient) {
    _inherits(ConnextInternal, _ConnextClient);

    function ConnextInternal(opts, wallet) {
        _classCallCheck(this, ConnextInternal);

        var _this2 = _possibleConstructorReturn(this, (ConnextInternal.__proto__ || Object.getPrototypeOf(ConnextInternal)).call(this, opts));

        _this2._latestState = null;
        _this2._saving = Promise.resolve();
        _this2._savePending = false;
        _this2.opts = opts;
        // Internal things
        // The store shouldn't be used by anything before calling `start()`, so
        // leave it null until then.
        _this2.store = null;
        _this2.wallet = wallet;
        _this2.provider = wallet.provider;
        _this2.opts.origin = opts.origin || 'unknown';
        console.log('Using hub', opts.hub ? 'provided by caller' : "at " + _this2.opts.hubUrl);
        _this2.hub = opts.hub || new Hub_1.HubAPIClient(new networking_1.Networking(_this2.opts.hubUrl), _this2.opts.origin, _this2.wallet);
        opts.user = opts.user.toLowerCase();
        opts.hubAddress = opts.hubAddress.toLowerCase();
        opts.contractAddress = opts.contractAddress.toLowerCase();
        opts.gasMultiple = opts.gasMultiple || 1.5;
        _this2.contract = opts.contract || new ChannelManager_1.ChannelManager(wallet, opts.contractAddress, opts.gasMultiple);
        _this2.validator = new validator_1.Validator(opts.hubAddress, _this2.provider, _this2.contract.rawAbi);
        _this2.utils = new Utils_1.Utils();
        // Controllers
        _this2.exchangeController = new ExchangeController_1.ExchangeController('ExchangeController', _this2);
        _this2.syncController = new SyncController_1.default('SyncController', _this2);
        _this2.depositController = new DepositController_1.default('DepositController', _this2);
        _this2.buyController = new BuyController_1.default('BuyController', _this2);
        _this2.withdrawalController = new WithdrawalController_1.default('WithdrawalController', _this2);
        _this2.stateUpdateController = new StateUpdateController_1.default('StateUpdateController', _this2);
        _this2.collateralController = new CollateralController_1.default('CollateralController', _this2);
        _this2.threadsController = new ThreadsController_1.default('ThreadsController', _this2);
        _this2.redeemController = new RedeemController_1.RedeemController('RedeemController', _this2);
        return _this2;
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


    _createClass(ConnextInternal, [{
        key: "setPollInterval",
        value: function setPollInterval(ms) {
            return __awaiter(this, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee16() {
                return regeneratorRuntime.wrap(function _callee16$(_context16) {
                    while (1) {
                        switch (_context16.prev = _context16.next) {
                            case 0:
                                console.warn('This function has not been implemented yet');

                            case 1:
                            case "end":
                                return _context16.stop();
                        }
                    }
                }, _callee16, this);
            }));
        }
    }, {
        key: "withdrawal",
        value: function withdrawal(params) {
            return __awaiter(this, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee17() {
                return regeneratorRuntime.wrap(function _callee17$(_context17) {
                    while (1) {
                        switch (_context17.prev = _context17.next) {
                            case 0:
                                _context17.next = 2;
                                return this.withdrawalController.requestUserWithdrawal(params);

                            case 2:
                            case "end":
                                return _context17.stop();
                        }
                    }
                }, _callee17, this);
            }));
        }
    }, {
        key: "recipientNeedsCollateral",
        value: function recipientNeedsCollateral(recipient, amount) {
            return __awaiter(this, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee18() {
                var channel, chanBN, amtBN;
                return regeneratorRuntime.wrap(function _callee18$(_context18) {
                    while (1) {
                        switch (_context18.prev = _context18.next) {
                            case 0:
                                // get recipients channel
                                channel = void 0;
                                _context18.prev = 1;
                                _context18.next = 4;
                                return this.hub.getChannelByUser(recipient);

                            case 4:
                                channel = _context18.sent;
                                _context18.next = 12;
                                break;

                            case 7:
                                _context18.prev = 7;
                                _context18.t0 = _context18["catch"](1);

                                if (!(_context18.t0.status === 404)) {
                                    _context18.next = 11;
                                    break;
                                }

                                return _context18.abrupt("return", "Recipient channel does not exist. Recipient: " + recipient + ".");

                            case 11:
                                throw _context18.t0;

                            case 12:
                                // check if hub can afford payment
                                chanBN = types_1.convertChannelState('bn', channel.state);
                                amtBN = types_1.convertPayment('bn', amount);

                                if (!(chanBN.balanceWeiHub.lt(amtBN.amountWei) || chanBN.balanceTokenHub.lt(amtBN.amountToken))) {
                                    _context18.next = 16;
                                    break;
                                }

                                return _context18.abrupt("return", 'Recipient needs collateral to facilitate payment.');

                            case 16:
                                return _context18.abrupt("return", null);

                            case 17:
                            case "end":
                                return _context18.stop();
                        }
                    }
                }, _callee18, this, [[1, 7]]);
            }));
        }
    }, {
        key: "start",
        value: function start() {
            var _this3 = this;

            var _super = Object.create(null, {
                start: { get: function get() {
                        return _get(ConnextInternal.prototype.__proto__ || Object.getPrototypeOf(ConnextInternal.prototype), "start", _this3);
                    } }
            });
            return __awaiter(this, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee20() {
                var _this4 = this;

                var syncedOpts, custodialBalance, channelAndUpdate, latestValid, lastThreadUpdateId, threadHistoryDuplicates, threadHistory, initialStates, threadRows, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, controller;

                return regeneratorRuntime.wrap(function _callee20$(_context20) {
                    while (1) {
                        switch (_context20.prev = _context20.next) {
                            case 0:
                                _context20.next = 2;
                                return this.getStore();

                            case 2:
                                this.store = _context20.sent;

                                this.store.subscribe(function () {
                                    return __awaiter(_this4, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee19() {
                                        var state;
                                        return regeneratorRuntime.wrap(function _callee19$(_context19) {
                                            while (1) {
                                                switch (_context19.prev = _context19.next) {
                                                    case 0:
                                                        state = this.store.getState();

                                                        this.emit('onStateChange', state);
                                                        _context19.next = 4;
                                                        return this._saveState(state);

                                                    case 4:
                                                    case "end":
                                                        return _context19.stop();
                                                }
                                            }
                                        }, _callee19, this);
                                    }));
                                });
                                // before starting controllers, sync values
                                _context20.next = 6;
                                return this.syncConfig();

                            case 6:
                                syncedOpts = _context20.sent;

                                this.store.dispatch(actions.setHubAddress(syncedOpts.hubAddress));
                                // auth is handled on each endpoint posting via the Hub API Client
                                // get any custodial balances
                                _context20.next = 10;
                                return this.hub.getCustodialBalance();

                            case 10:
                                custodialBalance = _context20.sent;

                                if (custodialBalance) {
                                    this.store.dispatch(actions.setCustodialBalance(custodialBalance));
                                }
                                // TODO: appropriately set the latest
                                // valid state ??
                                _context20.next = 14;
                                return this.hub.getLatestChannelStateAndUpdate();

                            case 14:
                                channelAndUpdate = _context20.sent;

                                if (!channelAndUpdate) {
                                    _context20.next = 41;
                                    break;
                                }

                                this.store.dispatch(actions.setChannelAndUpdate(channelAndUpdate));
                                // update the latest valid state
                                _context20.next = 19;
                                return this.hub.getLatestStateNoPendingOps();

                            case 19:
                                latestValid = _context20.sent;

                                if (latestValid) {
                                    this.store.dispatch(actions.setLatestValidState(latestValid));
                                }
                                // unconditionally update last thread update id, thread history
                                _context20.next = 23;
                                return this.hub.getLastThreadUpdateId();

                            case 23:
                                lastThreadUpdateId = _context20.sent;

                                this.store.dispatch(actions.setLastThreadUpdateId(lastThreadUpdateId));
                                // extract thread history, sort by descending threadId
                                _context20.next = 27;
                                return this.hub.getAllThreads();

                            case 27:
                                _context20.t0 = function (t) {
                                    return {
                                        receiver: t.receiver,
                                        sender: t.sender,
                                        threadId: t.threadId
                                    };
                                };

                                _context20.t1 = function (a, b) {
                                    return b.threadId - a.threadId;
                                };

                                threadHistoryDuplicates = _context20.sent.map(_context20.t0).sort(_context20.t1);

                                // filter duplicates
                                threadHistory = threadHistoryDuplicates.filter(function (thread, i) {
                                    var search = JSON.stringify({
                                        receiver: thread.receiver,
                                        sender: thread.sender
                                    });
                                    var elts = threadHistoryDuplicates.map(function (t) {
                                        return JSON.stringify({ sender: t.sender, receiver: t.receiver });
                                    });
                                    return elts.indexOf(search) === i;
                                });

                                this.store.dispatch(actions.setThreadHistory(threadHistory));
                                // if thread count is greater than 0, update
                                // activeThreads, initial states

                                if (!(channelAndUpdate.state.threadCount > 0)) {
                                    _context20.next = 41;
                                    break;
                                }

                                _context20.next = 35;
                                return this.hub.getThreadInitialStates();

                            case 35:
                                initialStates = _context20.sent;

                                this.store.dispatch(actions.setActiveInitialThreadStates(initialStates));
                                _context20.next = 39;
                                return this.hub.getActiveThreads();

                            case 39:
                                threadRows = _context20.sent;

                                this.store.dispatch(actions.setActiveThreads(threadRows));

                            case 41:
                                // Start all controllers
                                _iteratorNormalCompletion = true;
                                _didIteratorError = false;
                                _iteratorError = undefined;
                                _context20.prev = 44;
                                _iterator = this.getControllers()[Symbol.iterator]();

                            case 46:
                                if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                                    _context20.next = 55;
                                    break;
                                }

                                controller = _step.value;

                                console.log('Starting:', controller.name);
                                _context20.next = 51;
                                return controller.start();

                            case 51:
                                console.log('Done!', controller.name, 'started.');

                            case 52:
                                _iteratorNormalCompletion = true;
                                _context20.next = 46;
                                break;

                            case 55:
                                _context20.next = 61;
                                break;

                            case 57:
                                _context20.prev = 57;
                                _context20.t2 = _context20["catch"](44);
                                _didIteratorError = true;
                                _iteratorError = _context20.t2;

                            case 61:
                                _context20.prev = 61;
                                _context20.prev = 62;

                                if (!_iteratorNormalCompletion && _iterator.return) {
                                    _iterator.return();
                                }

                            case 64:
                                _context20.prev = 64;

                                if (!_didIteratorError) {
                                    _context20.next = 67;
                                    break;
                                }

                                throw _iteratorError;

                            case 67:
                                return _context20.finish(64);

                            case 68:
                                return _context20.finish(61);

                            case 69:
                                _context20.next = 71;
                                return _super.start.call(this);

                            case 71:
                            case "end":
                                return _context20.stop();
                        }
                    }
                }, _callee20, this, [[44, 57, 61, 69], [62,, 64, 68]]);
            }));
        }
    }, {
        key: "stop",
        value: function stop() {
            var _this5 = this;

            var _super = Object.create(null, {
                stop: { get: function get() {
                        return _get(ConnextInternal.prototype.__proto__ || Object.getPrototypeOf(ConnextInternal.prototype), "stop", _this5);
                    } }
            });
            return __awaiter(this, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee21() {
                var _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, controller;

                return regeneratorRuntime.wrap(function _callee21$(_context21) {
                    while (1) {
                        switch (_context21.prev = _context21.next) {
                            case 0:
                                // Stop all controllers
                                _iteratorNormalCompletion2 = true;
                                _didIteratorError2 = false;
                                _iteratorError2 = undefined;
                                _context21.prev = 3;
                                _iterator2 = this.getControllers()[Symbol.iterator]();

                            case 5:
                                if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
                                    _context21.next = 12;
                                    break;
                                }

                                controller = _step2.value;
                                _context21.next = 9;
                                return controller.stop();

                            case 9:
                                _iteratorNormalCompletion2 = true;
                                _context21.next = 5;
                                break;

                            case 12:
                                _context21.next = 18;
                                break;

                            case 14:
                                _context21.prev = 14;
                                _context21.t0 = _context21["catch"](3);
                                _didIteratorError2 = true;
                                _iteratorError2 = _context21.t0;

                            case 18:
                                _context21.prev = 18;
                                _context21.prev = 19;

                                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                                    _iterator2.return();
                                }

                            case 21:
                                _context21.prev = 21;

                                if (!_didIteratorError2) {
                                    _context21.next = 24;
                                    break;
                                }

                                throw _iteratorError2;

                            case 24:
                                return _context21.finish(21);

                            case 25:
                                return _context21.finish(18);

                            case 26:
                                _context21.next = 28;
                                return _super.stop.call(this);

                            case 28:
                            case "end":
                                return _context21.stop();
                        }
                    }
                }, _callee21, this, [[3, 14, 18, 26], [19,, 21, 25]]);
            }));
        }
    }, {
        key: "generateSecret",
        value: function generateSecret() {
            return ethers_1.ethers.utils.solidityKeccak256(['bytes32'], [ethers_1.ethers.utils.randomBytes(32)]);
        }
    }, {
        key: "getContractEvents",
        value: function getContractEvents(eventName, fromBlock) {
            return __awaiter(this, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee22() {
                return regeneratorRuntime.wrap(function _callee22$(_context22) {
                    while (1) {
                        switch (_context22.prev = _context22.next) {
                            case 0:
                                return _context22.abrupt("return", this.contract.getPastEvents(eventName, [this.opts.user], fromBlock));

                            case 1:
                            case "end":
                                return _context22.stop();
                        }
                    }
                }, _callee22, this);
            }));
        }
    }, {
        key: "signChannelState",
        value: function signChannelState(state) {
            return __awaiter(this, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee23() {
                var hash, _opts, user, hubAddress, sig;

                return regeneratorRuntime.wrap(function _callee23$(_context23) {
                    while (1) {
                        switch (_context23.prev = _context23.next) {
                            case 0:
                                if (!(state.user.toLowerCase() !== this.opts.user.toLowerCase() || state.contractAddress.toLowerCase() !== this.opts.contractAddress.toLowerCase())) {
                                    _context23.next = 2;
                                    break;
                                }

                                throw new Error("Refusing to sign channel state update which changes user or contract: " + ("expected user: " + this.opts.user + ", expected contract: " + this.opts.contractAddress + " ") + ("actual state: " + JSON.stringify(state)));

                            case 2:
                                hash = this.utils.createChannelStateHash(state);
                                _opts = this.opts, user = _opts.user, hubAddress = _opts.hubAddress;
                                _context23.next = 6;
                                return this.wallet.signMessage(hash);

                            case 6:
                                sig = _context23.sent;
                                return _context23.abrupt("return", types_1.addSigToChannelState(state, sig, true));

                            case 8:
                            case "end":
                                return _context23.stop();
                        }
                    }
                }, _callee23, this);
            }));
        }
    }, {
        key: "signThreadState",
        value: function signThreadState(state) {
            return __awaiter(this, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee24() {
                var userInThread, hash, sig;
                return regeneratorRuntime.wrap(function _callee24$(_context24) {
                    while (1) {
                        switch (_context24.prev = _context24.next) {
                            case 0:
                                userInThread = state.sender === this.opts.user || state.receiver === this.opts.user;

                                if (!(!userInThread || state.contractAddress !== this.opts.contractAddress)) {
                                    _context24.next = 3;
                                    break;
                                }

                                throw new Error("Refusing to sign thread state update which changes user or contract: " + ("expected user: " + this.opts.user + ", expected contract: " + this.opts.contractAddress + " ") + ("actual state: " + JSON.stringify(state)));

                            case 3:
                                hash = this.utils.createThreadStateHash(state);
                                _context24.next = 6;
                                return this.wallet.signMessage(hash);

                            case 6:
                                sig = _context24.sent;

                                console.log("Signing thread state " + state.txCount + ": " + sig, state);
                                return _context24.abrupt("return", types_1.addSigToThreadState(state, sig));

                            case 9:
                            case "end":
                                return _context24.stop();
                        }
                    }
                }, _callee24, this);
            }));
        }
    }, {
        key: "signDepositRequestProposal",
        value: function signDepositRequestProposal(args) {
            return __awaiter(this, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee25() {
                var hash, sig;
                return regeneratorRuntime.wrap(function _callee25$(_context25) {
                    while (1) {
                        switch (_context25.prev = _context25.next) {
                            case 0:
                                hash = this.utils.createDepositRequestProposalHash(args);
                                _context25.next = 3;
                                return this.wallet.signMessage(hash);

                            case 3:
                                sig = _context25.sent;

                                console.log("Signing deposit request " + JSON.stringify(args, null, 2) + ". Sig: " + sig);
                                return _context25.abrupt("return", Object.assign({}, args, { sigUser: sig }));

                            case 6:
                            case "end":
                                return _context25.stop();
                        }
                    }
                }, _callee25, this);
            }));
        }
        /**
         * Waits for any persistent state to be saved.
         * If the save fails, the promise will reject.
         */

    }, {
        key: "awaitPersistentStateSaved",
        value: function awaitPersistentStateSaved() {
            return this._saving;
        }
        ////////////////////////////////////////
        // Begin Public Method Implementations

    }, {
        key: "_saveState",
        value: function _saveState(state) {
            return __awaiter(this, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee27() {
                var _this6 = this;

                return regeneratorRuntime.wrap(function _callee27$(_context27) {
                    while (1) {
                        switch (_context27.prev = _context27.next) {
                            case 0:
                                if (this.opts.saveState) {
                                    _context27.next = 2;
                                    break;
                                }

                                return _context27.abrupt("return");

                            case 2:
                                if (!(this._latestState === state.persistent)) {
                                    _context27.next = 4;
                                    break;
                                }

                                return _context27.abrupt("return");

                            case 4:
                                this._latestState = state.persistent;

                                if (!this._savePending) {
                                    _context27.next = 7;
                                    break;
                                }

                                return _context27.abrupt("return");

                            case 7:
                                this._savePending = true;
                                this._saving = new Promise(function (res, rej) {
                                    // Only save the state after all the currently pending operations have
                                    // completed to make sure that subsequent state updates will be atomic.
                                    setTimeout(function () {
                                        return __awaiter(_this6, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee26() {
                                            var err;
                                            return regeneratorRuntime.wrap(function _callee26$(_context26) {
                                                while (1) {
                                                    switch (_context26.prev = _context26.next) {
                                                        case 0:
                                                            err = null;
                                                            _context26.prev = 1;
                                                            _context26.next = 4;
                                                            return this._saveLoop();

                                                        case 4:
                                                            _context26.next = 9;
                                                            break;

                                                        case 6:
                                                            _context26.prev = 6;
                                                            _context26.t0 = _context26["catch"](1);

                                                            err = _context26.t0;

                                                        case 9:
                                                            // Be sure to set `_savePending` to `false` before resolve/reject
                                                            // in case the state changes during res()/rej()
                                                            this._savePending = false;
                                                            return _context26.abrupt("return", err ? rej(err) : res());

                                                        case 11:
                                                        case "end":
                                                            return _context26.stop();
                                                    }
                                                }
                                            }, _callee26, this, [[1, 6]]);
                                        }));
                                    }, 1);
                                });

                            case 9:
                            case "end":
                                return _context27.stop();
                        }
                    }
                }, _callee27, this);
            }));
        }
        /**
         * Because it's possible that the state will continue to be updated while
         * a previous state is saving, loop until the state doesn't change while
         * it's being saved before we return.
         */

    }, {
        key: "_saveLoop",
        value: function _saveLoop() {
            return __awaiter(this, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee28() {
                var result, state, _ref, _ref2, timeout, _;

                return regeneratorRuntime.wrap(function _callee28$(_context28) {
                    while (1) {
                        switch (_context28.prev = _context28.next) {
                            case 0:
                                result = null;

                            case 1:
                                if (!true) {
                                    _context28.next = 15;
                                    break;
                                }

                                state = this._latestState;

                                result = this.opts.saveState(JSON.stringify(state));
                                // Wait for any current save to finish, but ignore any error it might raise
                                _context28.next = 6;
                                return utils_1.timeoutPromise(result.then(null, function () {
                                    return null;
                                }), 10 * 1000);

                            case 6:
                                _ref = _context28.sent;
                                _ref2 = _slicedToArray(_ref, 2);
                                timeout = _ref2[0];
                                _ = _ref2[1];

                                if (timeout) {
                                    console.warn('Timeout (10 seconds) while waiting for state to save. ' + 'This error will be ignored (which may cause data loss). ' + 'User supplied function that has not returned:', this.opts.saveState);
                                }

                                if (!(this._latestState === state)) {
                                    _context28.next = 13;
                                    break;
                                }

                                return _context28.abrupt("break", 15);

                            case 13:
                                _context28.next = 1;
                                break;

                            case 15:
                            case "end":
                                return _context28.stop();
                        }
                    }
                }, _callee28, this);
            }));
        }
    }, {
        key: "dispatch",
        value: function dispatch(action) {
            this.store.dispatch(action);
        }
    }, {
        key: "syncConfig",
        value: function syncConfig() {
            return __awaiter(this, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee29() {
                var _this7 = this;

                var config, adjusted;
                return regeneratorRuntime.wrap(function _callee29$(_context29) {
                    while (1) {
                        switch (_context29.prev = _context29.next) {
                            case 0:
                                _context29.next = 2;
                                return this.hub.config();

                            case 2:
                                config = _context29.sent;
                                adjusted = {};

                                Object.keys(this.opts).map(function (k) {
                                    if (k || Object.keys(_this7.opts).indexOf(k) !== -1) {
                                        // user supplied, igonore
                                        adjusted[k] = _this7.opts[k];
                                        return;
                                    }
                                    adjusted[k] = config[k];
                                });
                                return _context29.abrupt("return", adjusted);

                            case 6:
                            case "end":
                                return _context29.stop();
                        }
                    }
                }, _callee29, this);
            }));
        }
    }, {
        key: "getControllers",
        value: function getControllers() {
            var res = [];
            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = Object.keys(this)[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var key = _step3.value;

                    var val = this[key];
                    var isController = val && utils_1.isFunction(val.start) && utils_1.isFunction(val.stop) && val !== this;
                    if (isController) res.push(val);
                }
            } catch (err) {
                _didIteratorError3 = true;
                _iteratorError3 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion3 && _iterator3.return) {
                        _iterator3.return();
                    }
                } finally {
                    if (_didIteratorError3) {
                        throw _iteratorError3;
                    }
                }
            }

            return res;
        }
    }, {
        key: "getStore",
        value: function getStore() {
            return __awaiter(this, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee30() {
                var state, loadedState;
                return regeneratorRuntime.wrap(function _callee30$(_context30) {
                    while (1) {
                        switch (_context30.prev = _context30.next) {
                            case 0:
                                if (!this.opts.store) {
                                    _context30.next = 2;
                                    break;
                                }

                                return _context30.abrupt("return", this.opts.store);

                            case 2:
                                state = new store_1.ConnextState();

                                state.persistent.channel = Object.assign({}, state.persistent.channel, { contractAddress: this.opts.contractAddress || '', recipient: this.opts.user, user: this.opts.user });
                                state.persistent.latestValidState = state.persistent.channel;

                                if (!this.opts.loadState) {
                                    _context30.next = 10;
                                    break;
                                }

                                _context30.next = 8;
                                return this.opts.loadState();

                            case 8:
                                loadedState = _context30.sent;

                                if (loadedState) {
                                    state.persistent = JSON.parse(loadedState);
                                }

                            case 10:
                                return _context30.abrupt("return", redux_1.createStore(reducers_1.reducers, state, redux_1.applyMiddleware(middleware_1.handleStateFlags)));

                            case 11:
                            case "end":
                                return _context30.stop();
                        }
                    }
                }, _callee30, this);
            }));
        }
    }]);

    return ConnextInternal;
}(ConnextClient);

exports.ConnextInternal = ConnextInternal;
//# sourceMappingURL=Connext.js.map