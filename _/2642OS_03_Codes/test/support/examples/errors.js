'use strict';

module.exports = {
  badQuantity: function (quantity) {
    return {
      key: "error.quantity",
      params:[quantity]
    };
  },
  beverageDoesNotExist: function () {
    return {
      key: "error.beverage.notExists"
    };
  }
};