#!/usr/bin/env node
var path = require('path')
  , fs = require('fs')
  , argv = require('optimist').argv
  , tweetbot = require('../')
  ;

if (argv.conf) {
  argv.conf = path.join(process.cwd(), argv.conf);
}
else {
  argv.conf = path.join(process.cwd(), 'tweetbot.json');
}

fs.existsSync || (fs.existsSync = path.existsSync);
if (!fs.existsSync(argv.conf)) {
  console.error('Conf file not fould: ' + argv.conf);
  process.exit(1);
}

tweetbot(require(argv.conf));