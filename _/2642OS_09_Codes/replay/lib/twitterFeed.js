'use strict';

var Twitter = require('twitter-js-client').Twitter,
    Q = require('q');

module.exports = function (config) {
  var twitter = new Twitter(config);

  return {
    lastTweets: function (name, maxCount) {
      return Q.Promise(function (resolve, reject) {
        twitter.getUserTimeline({
          screen_name: name,
          count: maxCount
        }, reject, function (json) {
          try {
            var entries = JSON.parse(json);
            resolve(entries.map(function (entry) {
              return entry.text;
            }));
          } catch (e) {
            reject(e);
          }
        });
      });
    }
  };
};