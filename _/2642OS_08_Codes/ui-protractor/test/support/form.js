'use strict';

var Key = protractor.Key;

function newInputView(browser, name, element) {
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
      return browser.executeScript(function () {
        return !arguments[0].disabled;
      }, element.getWebElement());
    },
    clear: element.clear.bind(element),
    typeText: element.sendKeys.bind(element),
    pressKey: function (keyName) {
      return element.sendKeys(Key[keyName]);
    },
    click: element.click.bind(element)
  };
}

module.exports = function (browser, element) {
  var errorMessages = element.$$('.error-msg');

  return {
    method: function () {
      return element.getAttribute('method').then(function (method) {
        return method.toUpperCase();
      });
    },
    target: function () {
      return element.getAttribute('action');
    },
    isShown: function () {
      return element.isDisplayed();
    },
    errorMessage: function (i) {
      return errorMessages.get(i).getText();
    },
    fieldWithName: function (name) {
      return newInputView(browser, name,
          element.$('input[name="' + name + '"]')
      );
    }
  };
};