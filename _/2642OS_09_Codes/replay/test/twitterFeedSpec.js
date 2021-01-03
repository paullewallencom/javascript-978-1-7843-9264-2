'use strict';

var newFeed = require('../lib/twitterFeed'),
    chai = require('chai'),
    expect = chai.expect,
    replay = require('replay');

chai.use(require('chai-as-promised'));

replay.headers = [/^accept/, /^body/, /^content-type/, /^host/, /^if-/, /^x-/];

describe('A twitter feed', function () {
  var feed;
  beforeEach(function () {
    feed = newFeed({
      // Use your app credentials here!
      consumerKey: "",
      consumerSecret: ""
    });
  });

  function willRetrieveTheLastPublicationsOfAUser(example) {
    var numberOfPublications = example.expectedPublications.length,
        user = example.user;

    it('will retrieve the last ' + numberOfPublications + ' publications of @' + user, function () {
      var result = feed.lastTweets(user, numberOfPublications);

      return expect(result).to.eventually
          .be.deep.equal(example.expectedPublications);
    });
  }

  [
    {
      user: 'eamodeorubio',
      expectedPublications: [
        "RT @javasaurio: @eamodeorubio SoundCloud obtiene el primer apoyo de una gran discográfica: Warner http://t.co/9W96BrALcC",
        "@old_sound it's a pity!",
        "@old_sound until when are you staying in Berlin?"
      ]
    },
    {
      user: 'eamodeorubio',
      expectedPublications: [
        "RT @javasaurio: @eamodeorubio SoundCloud obtiene el primer apoyo de una gran discográfica: Warner http://t.co/9W96BrALcC",
        "@old_sound it's a pity!",
        "@old_sound until when are you staying in Berlin?",
        "@nucliweb pero yo le dedicaria más esfuerzo a ir estudiando las novedades de ES6",
        "@nucliweb aunque no lo uso a diario, si fuera tu le echaria un vistazo.Tiene una sintaxis muy elegante y solventa algunos problemas de js."
      ]
    }
  ].forEach(willRetrieveTheLastPublicationsOfAUser);
});