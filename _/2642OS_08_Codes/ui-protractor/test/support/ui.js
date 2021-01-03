'use strict';

var newOrderView = require('./order');

module.exports = function (port, browser) {
  function uriFor(uiName) {
    return 'http://localhost:' + port + '/test/' + uiName + '.html';
  }

  return {
    uriFor: uriFor,
    goTo: function (uiName) {
      return browser.get(uriFor(uiName));
    },
    newOrderView: function () {
      return newOrderView(browser);
    },
    goBack: function () {
      return browser.navigate().back();
    },
    executeScript: browser.executeScript.bind(browser),
    executeAsyncScript: browser.executeAsyncScript.bind(browser),
    currentUrl: browser.driver.getCurrentUrl.bind(browser.driver)
  };
};