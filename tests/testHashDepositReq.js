//import Web3 from 'web3';

const Web3 = require('web3');
const web3 = new Web3();
const eth = require("ethers");

const wallet = new eth.Wallet('0x6fcba9c88aa315be9a223d001f37af6c4d7f8ce04952a0f3c1ee45599ac02ffd');

let result = eth.utils.solidityKeccak256(['uint256', 'uint256'], [0, 10000000000000000] );
console.log(result);
