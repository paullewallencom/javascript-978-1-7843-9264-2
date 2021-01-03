'use strict';

var promise = require('selenium-webdriver').promise;

module.exports = function (element) {
  return {
    info: function () {
      return promise.all([
        element.findElement({css: '.name'}).getText(),
        element.findElement({css: '.quantity'}).getText(),
        element.findElement({css: '.price'}).getText()
      ]).then(function (fields) {
        return {
          name: fields[0],
          quantity: fields[1],
          unitPrice: fields[2]
        };
      });
    }
  };
};