#!/usr/bin/env node
var prompt = require('prompt')
  , argv = require('optimist').argv
  , fs = require('fs')
  ;

var confPath = argv.path || './tweetbot.json';
prompt.message = 'tweetbot';
prompt.override = argv;
prompt.start();

prompt.get([{
  name: 'consumer_key',
  description: 'Consumer key',
  required: true
}, {
  name: 'consumer_secret',
  description: 'Consumer secret',
  required: true
}, {
  name: 'access_token_key',
  description: 'Access token (must have read+write access)',
  required: true
}, {
  name: 'access_token_secret',
  description: 'Access token secret',
  required: true
}], function(err, result) {
  fs.writeFile(confPath, JSON.stringify(result, null, 2), function(err) {
    if (err) throw err;
    fs.chmod(confPath, 0600, function(err) {
      if (err) throw err;
      console.log('Saved configuration to ' + confPath);
    });
  });
});