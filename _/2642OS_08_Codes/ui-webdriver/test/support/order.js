'use strict';

var newItemView = require('./orderItem'),
    newFormView = require('./form');

function newCollection(elements, newView) {
  return {
    size: function () {
      return elements.then(function (arrayOfElements) {
        return arrayOfElements.length;
      });
    },
    info: function (i) {
      return elements.then(function (arrayOfElements) {
        return newView(arrayOfElements[i]).info();
      });
    }
  }
}

module.exports = function (driver) {
  var containerSel, self;

  self = {
    init: function (containerSelector, controllerName) {
      containerSel = containerSelector;
      return driver.executeScript(function () {
        window.view = require('order-view')(arguments[0], window[arguments[1]]);
      }, containerSelector, controllerName);
    },
    isInitialized: function () {
      return driver.executeScript(function () {
        return window.view && typeof window.view === 'object';
      });
    },
    redirectTo: function (newUrl) {
      return driver.executeScript(function () {
        return window.view.redirectTo(arguments[0]);
      }, newUrl);
    },
    update: function (viewModel) {
      return driver.executeAsyncScript(function () {
        // 'done' is callback injected by webdriver as last
        // parameter to notify the async script is done
        var done = arguments[1];
        view.update(arguments[0], done);
      }, viewModel);
    },
    totalPrice: function () {
      return driver.findElement({
        css: containerSel + ' .order .price'
      }).getText();
    },
    items: function () {
      return newCollection(driver.findElements({
        css: containerSel + ' .order .item'
      }), newItemView);
    },
    addBeverageForm: function () {
      return newFormView(driver, driver.findElement({
        css: containerSel + ' .order form.add-beverage'
      }));
    }
  };

  return self;
};