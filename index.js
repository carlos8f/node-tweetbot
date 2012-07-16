var twitter = require('ntwitter')
  , markov = require('markov')
  , Stream = require('stream')
  ;

module.exports = function(options) {
  var tw = new twitter(options)
    , m = markov(1)
    , tweetBase = {}
    , loadTimeout
    ;

  function onTweet(tweet) {
    if (tweet && tweet.text) {
      m.seed(tweet.text);
    }
  }

  function removeMentions(words) {
    if (options.removeMentions) {
      words.forEach(function(word, k) {
        if (word.indexOf('@') === 0) {
          words[k] = word.substring(1);
        }
      });
    }
    return words;
  }

  tw
    .getHomeTimeline(function(err, data) {
      if (err) {
        console.error(err);
        process.exit(1);
      }
      Object.keys(data).forEach(function(k) {
        onTweet(data[k]);
      });
      tweetSomething();
    })
    .stream('user', function(stream) {
      stream.on('data', onTweet);
      stream.on('error', function(err) {
        console.error(err);
        process.exit(1);
      });
      stream.on('end', function() {
        console.error('Socket connection to Twitter ended! Exiting.');
        process.exit();
      });
    });

  function tweetSomething() {
    var tweet = removeMentions(m.fill(m.pick(), Math.round((Math.random() * 100) + 20))).join(' ');
    tw.updateStatus(tweet, function(err, data) {
      if (err) {
        console.error('tried to tweet: ' + tweet);
        console.error(err);
        process.exit(1);
      }
      console.log('tweeted: ' + tweet);
    });
    setTimeout(tweetSomething, options.tweetInterval || 1000 * 60 * 60);
  }
};
