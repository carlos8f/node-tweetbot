var modeler = require('modeler-twitter')
  , ntwitter = require('ntwitter')
  , markov = require('markov')
  , natural = require('natural')

module.exports = function (options) {
  var home = modeler({
    name: 'tweets',
    oauth: options.oauth
  });

  var twitter = new ntwitter({
    consumer_key: options.oauth.consumer_key,
    consumer_secret: options.oauth.consumer_secret,
    access_token_key: options.oauth.token,
    access_token_secret: options.oauth.token_secret
  });

  // @todo: classify hashtags
  var classifier = new natural.BayesClassifier();
  function classifyHashtags (text) {

  }

  function stripMentions (words) {
    return words.filter(function (word) {
      return !!word.match(/^@/);
    });
  }

  function createTweet (words, maxLength) {
    maxLength || (maxLength = 140);
    var text = '';
    for (var idx = 0; idx < words.length; idx++) {
      var tmp = text + ' ' + words[idx];
      if (tmp.length > 140) break;
      text = tmp;
    }
    return text;
  }

  twitter.verifyCredentials(function (err, user) {
    if (err) throw err;

    var m = markov();

    home.tail(0, {load: true}, processChunk);

    function processChunk (err, chunk, next) {
      if (err) throw err;
      chunk.forEach(function (tweet) {
        m.seed(tweet.text);
      });
      if (chunk.length && next) next();
    }

    twitter.stream('user', {'with': 'followings', 'replies': 'all'}, function (stream) {
      stream.on('data', function (data) {
        if (data.text) {
          m.seed(data.text, function () {
            if (data.in_reply_to_screen_name === user.screen_name) {
              // respond
              var words = ['@' + data.user.screen_name].concat(stripMentions(m.respond(data.text, 100)));
              var text = createTweet(words);
              twitter.updateStatus(text, function (err, data) {
                if (err) throw err;
                console.log('tweeted:', data.text || data);
              });
            }
          });
        }
      });
      stream.on('end', function (response) {
        // Handle a disconnection
      });
      stream.on('destroy', function (response) {
        // Handle a 'silent' disconnection from Twitter, no end/error event fired
      });
    });
  });
};
