#!/usr/bin/env node
var path = require('path')
  , fs = require('fs')
  , argv = require('optimist')
    .default('conf', path.join(__dirname, '../tweetbot.json'))
    .argv
  , tweetbot = require('../')
  ;

fs.existsSync || (fs.existsSync = path.existsSync);
if (!fs.existsSync(argv.conf)) {
  console.error('Conf file not fould: ' + argv.conf);
  process.exit(1);
}

tweetbot(require(argv.conf));