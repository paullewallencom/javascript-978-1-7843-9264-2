'use strict';

module.exports = function (responseData) {
  return {
    _links: {
      self: {href: responseData.uri},
      target: {href: responseData.orderUri}
    },
    name: 'place-order-form',
    method: 'POST',
    parameters: {
      status: 'placed'
    }
  };
};