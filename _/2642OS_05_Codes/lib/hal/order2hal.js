'use strict';

var createFormAsHAL = require('./createForm2hal'),
    placeOrderFormAsHAL = require('./placeOrderForm2hal');

module.exports = function (orderResponse) {
  if (!orderResponse)
    return;
  var orderModel = orderResponse.order,
      orderURI = orderResponse.uri,
      links = {},
      numberOrItems = orderModel.items && orderModel.items.length,
      halOrder = {
        _links: links,
        totalPrice: orderModel.totalPrice || 0,
        messages: orderModel.messages || []
      };

  var linkTypesByAction = {
    'place-order': function (actionModel) {
      var formLink = {href: orderURI + '/place-order-form'};
      links['place-order-form'] = formLink;

      if (!halOrder._embedded)
        halOrder._embedded = {};

      halOrder._embedded['place-order-form'] = placeOrderFormAsHAL({
        action: actionModel,
        uri: formLink.href,
        orderUri: orderURI
      });
    },
    'append-beverage': function (actionModel) {
      var formLink = {href: orderURI + '/create-form'};
      links['create-form'] = formLink;

      if (!halOrder._embedded)
        halOrder._embedded = {};

      halOrder._embedded['create-form'] = createFormAsHAL({
        action: actionModel,
        items: orderModel.items,
        uri: formLink.href,
        orderUri: orderURI
      });
    }
  };

  links.self = {href: orderURI};

  if (numberOrItems) {
    var itemLinks = [];
    for (var i = 0; i < numberOrItems; i++) {
      itemLinks.push({
        href: orderURI + '/item_' + i
      });
    }
    links.item = itemLinks;
  }

  if (orderModel.actions) {
    orderModel.actions.forEach(function (actionModel) {
      var linkType = linkTypesByAction[actionModel.action];
      if (typeof linkType === 'function')
        linkType(actionModel);
    });
  }

  return halOrder;
};