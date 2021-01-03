'use strict';

var Key = require('selenium-webdriver').Key;

function newInputView(driver, name, element) {
  return {
    name: function () {
      return name;
    },
    type: function () {
      return element.getAttribute('type');
    },
    value: function () {
      return element.getAttribute('value');
    },
    isMarkedAsError: function () {
      return element.getAttribute('class').then(function (classNames) {
        return classNames.indexOf('error') !== -1;
      });
    },
    isEnabled: function () {
      return driver.executeScript(function () {
        return !arguments[0].disabled;
      }, element)
    },
    clear: element.clear.bind(element),
    typeText: element.sendKeys.bind(element),
    pressKey: function (keyName) {
      return element.sendKeys(Key[keyName]);
    },
    click: element.click.bind(element)
  };
}

module.exports = function (driver, element) {
  return {
    method: function () {
      return element.getAttribute('method');
    },
    target: function () {
      return element.getAttribute('action');
    },
    isShown: function () {
      return element.isDisplayed();
    },
    errorMessage: function (i) {
      return element.findElement({
        css: '.error-msg:nth-of-type(' + (i + 1) + ')'
      }).getText();
    },
    fieldWithName: function (name) {
      return newInputView(driver, name, element.findElement({
        css: 'input[name="' + name + '"]'
      }));
    }
  };
};