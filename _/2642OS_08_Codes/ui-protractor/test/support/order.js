'use strict';

var newItemView = require('./orderItem'),
    newFormView = require('./form');

function newCollection(elements, newView) {
  return {
    size: function () {
      return elements.count();
    },
    info: function (i) {
      return newView(elements.get(i)).info();
    }
  }
}

module.exports = function (browser) {
  var totalPrice,
      addBeverageForm,
      items,
      self;

  function initElements(containerSelector) {
    var container = $(containerSelector);
    totalPrice = container.$('.order .price');
    addBeverageForm = container.$('.order form.add-beverage');
    items = container.$$('.order .item');
  }

  self = {
    init: function (containerSelector, controllerName) {
      initElements(containerSelector);

      return browser.executeScript(function () {
        window.view = require('order-view')(arguments[0], window[arguments[1]]);
      }, containerSelector, controllerName);
    },
    isInitialized: function () {
      return browser.executeScript(function () {
        return window.view && typeof window.view === 'object';
      });
    },
    redirectTo: function (newUrl) {
      return browser.executeScript(function () {
        return window.view.redirectTo(arguments[0]);
      }, newUrl);
    },
    update: function (viewModel) {
      return browser.executeAsyncScript(function () {
        // 'done' is callback injected by webdriver as last
        // parameter to notify the async script is done
        var done = arguments[1];
        view.update(arguments[0], done);
      }, viewModel);
    },
    totalPrice: function () {
      return totalPrice.getText();
    },
    items: function () {
      return newCollection(items, newItemView);
    },
    addBeverageForm: function () {
      return newFormView(browser, addBeverageForm);
    }
  };

  return self;
};