require('babel-core/register');
require('dotenv').config();

//TODO - Put this in networking.ts
global.fetch = require('node-fetch');
global.document = {};

var start = require('./lib/App.js').start;
start();
console.log('App instantiated');
