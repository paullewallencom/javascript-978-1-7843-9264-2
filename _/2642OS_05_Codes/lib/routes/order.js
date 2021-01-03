'use strict';

var express = require('express'),
    orderAsHAL = require('../hal/order2hal'),
    placeOrderFormAsHAL = require('../hal/placeOrderForm2hal'),
    createFormAsHAL = require('../hal/createForm2hal');

function actionNamed(actionName) {
  return function (actionModel) {
    return actionModel.action === actionName;
  };
}

function sendResponse(res, halPayload) {
  return function (data) {
    if (!data)
      return res.status(404).end();

    res.format({
      json: function () {
        res.send(data);
      },
      'application/hal+json': function () {
        res.send(halPayload(data));
      }
    });
  };
}

function sendError(res) {
  return function (err) {
    res.status(500).send({
      error: err.message
    }).end();
  };
}

module.exports = function (orderSystem) {
  var router = express.Router();

  router.get('/:id', function (req, res) {
    var orderId = req.params.id;
    orderSystem
        .display(orderId)
        .then(sendResponse(res, function (order) {
          return orderAsHAL({
            uri: req.originalUrl,
            order: order
          });
        }))
        .fail(sendError(res));
  });

  router.get('/:id/place-order-form', function (req, res) {
    var orderId = req.params.id;
    orderSystem
        .display(orderId)
        .then(function (order) {
          return order &&
              order.actions &&
              order.actions.filter(actionNamed('place-order'))[0]
        })
        .then(sendResponse(res, function (action) {
          var uri = req.originalUrl;

          return placeOrderFormAsHAL({
            action: action,
            uri: uri,
            orderUri: uri.slice(0, uri.lastIndexOf('/place-order-form'))
          });
        }))
        .fail(sendError(res));
  });

  router.get('/:id/create-form', function (req, res) {
    var orderId = req.params.id;
    orderSystem
        .display(orderId)
        .then(function (order) {
          var action = order && order.actions &&
              order.actions.filter(actionNamed('append-beverage'))[0];

          return action ? {
            action: action,
            items: order.items
          } : null;
        })
        .then(sendResponse(res, function (formData) {
          var uri = req.originalUrl;
          formData.uri = uri;
          formData.orderUri = uri.slice(0, uri.lastIndexOf('/create-form'));

          return createFormAsHAL(formData);
        }))
        .fail(sendError(res));
  });

  router.use(function (err, req, res, next) {
    console.error(err.stack);
    res.send(500, err);
  });

  return router;
};