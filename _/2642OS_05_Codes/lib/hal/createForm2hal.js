'use strict';

module.exports = function (formData) {
  var params = formData.action.parameters,
      numberOfItems = formData.items ? formData.items.length : 0;

  return {
    _links: {
      self: {
        href: formData.uri
      },
      target: {
        href: formData.orderUri + '/item_' + numberOfItems
      }
    },
    name: 'create-form',
    method: 'PUT',
    parameters: {
      quantity: params ? params.quantity : 0,
      beverageHref: params && params.beverageRef ? '/beverages/' + encodeURIComponent(params.beverageRef) : null
    }
  };
};