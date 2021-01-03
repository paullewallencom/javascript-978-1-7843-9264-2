'use strict';

module.exports = function (element) {
  var name = element.$('.name'),
      quantity = element.$('.quantity'),
      price = element.$('.price');

  return {
    info: function () {
      return protractor.promise.all([
        name.getText(),
        quantity.getText(),
        price.getText()
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