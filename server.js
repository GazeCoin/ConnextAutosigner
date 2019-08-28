require('babel-core/register');
require('dotenv').config({ path: './config/' + process.argv[2] + '/.env' });
console.log('argv ', process.argv[2]);

//TODO - Put this in networking.ts
global.fetch = require('node-fetch');
global.document = {};

var start = require('./lib/App.js').start;
start();
console.log('App instantiated');
