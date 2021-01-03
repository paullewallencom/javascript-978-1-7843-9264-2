'use strict';

var newOrderView = require('./order');

module.exports = function (port, driver) {
  function uriFor(uiName) {
    return 'http://localhost:' + port + '/test/' + uiName + '.html';
  }

  return {
    uriFor: uriFor,
    goTo: function (uiName) {
      return driver.get(uriFor(uiName));
    },
    newOrderView: function () {
      return newOrderView(driver);
    },
    goBack: function () {
      return driver.navigate().back();
    },
    executeScript: driver.executeScript.bind(driver),
    executeAsyncScript: driver.executeAsyncScript.bind(driver),
    currentUrl: driver.getCurrentUrl.bind(driver)
  };
};