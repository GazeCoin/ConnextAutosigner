"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getChannelBalanceInUSD = getChannelBalanceInUSD;
exports.getAmountInUSD = getAmountInUSD;
exports.getBalanceEth = getBalanceEth;
exports.getBalanceToken = getBalanceToken;

var _connext = require("connext");

var Connext = _interopRequireWildcard(_connext);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var _Connext$types = Connext.types,
    CurrencyConvertable = _Connext$types.CurrencyConvertable,
    CurrencyType = _Connext$types.CurrencyType,
    Currency = _Connext$types.Currency;

var _ref = new Connext.Utils(),
    getExchangeRates = _ref.getExchangeRates;

function getChannelBalanceInUSD(channelState, connextState) {
  var onlyTokens = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

  if (!connextState || !channelState) {
    return "$0.00";
  }

  var convertableTokens = new CurrencyConvertable(CurrencyType.BEI, channelState.balanceTokenUser, function () {
    return getExchangeRates(connextState);
  });

  if (onlyTokens) {
    return Currency.USD(convertableTokens.toUSD().amountBigNumber).format({});
  }

  var convertableWei = new CurrencyConvertable(CurrencyType.WEI, channelState.balanceWeiUser, function () {
    return getExchangeRates(connextState);
  });

  console.log('total:', convertableTokens.toBEI().amountBigNumber.plus(convertableWei.toBEI().amountBigNumber).toFixed(0));

  var total = new CurrencyConvertable(CurrencyType.BEI, convertableTokens.toBEI().amountBigNumber.plus(convertableWei.toBEI().amountBigNumber), function () {
    return getExchangeRates(connextState);
  }).toUSD().amountBigNumber;

  return Currency.USD(total).format({});
}

function getAmountInUSD(amount, connextState) {
  var onlyTokens = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

  if (!connextState || !amount) {
    return "$0.00";
  }
  var convertableTokens = new CurrencyConvertable(CurrencyType.BEI, amount.amountToken, function () {
    return getExchangeRates(connextState);
  });

  if (onlyTokens) {
    return Currency.USD(convertableTokens.toUSD().amountBigNumber).format({});
  }

  var convertableWei = new CurrencyConvertable(CurrencyType.WEI, amount.amountWei, function () {
    return getExchangeRates(connextState);
  });

  var totalBalance = Currency.USD(convertableTokens.toBEI().amountBigNumber.plus(convertableWei.toBEI)).format({});

  return totalBalance;
}

function getBalanceEth(amount, connextState) {
  if (!amount || !connextState) {
    return "$0.00";
  }

  var balance = new CurrencyConvertable(CurrencyType.WEI, amount, function () {
    return getExchangeRates(connextState);
  });

  var totalBalance = Currency.ETH(balance.toETH().amountBigNumber).format({});

  return totalBalance;
}

function getBalanceToken(amount, connextState) {
  if (!amount || !connextState) {
    return "$0.00";
  }

  var balance = new CurrencyConvertable(CurrencyType.BEI, amount, function () {
    return getExchangeRates(connextState);
  });

  var totalBalance = Currency.BOOTY(balance.toBOOTY().amountBigNumber).format({});

  return totalBalance;
}