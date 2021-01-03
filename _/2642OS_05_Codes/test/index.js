'use strict';

var sinon = require('sinon'),
    newRouteFor = require('../index'),
    newClient = require('./support/client'),
    express = require('express'),
    app = express(),
    server,
    currentOrderSystem,
    port = process.env.PORT || 3000;

before(function () {
  this.GET = newClient('http://localhost:' + port).GET;
});

before(function (cb) {
  this.ordersBaseURI = '/orders';
  app
      .use(this.ordersBaseURI, newRouteFor.order({
        display: function () {
          return currentOrderSystem.display.apply(currentOrderSystem, arguments);
        }
      }))
      .listen(port, function () {
        server = this;
        cb.apply(this, arguments);
      });
});

after(function (cb) {
  if (!server)
    return setImmediate(cb);
  server.close(cb);
});

beforeEach(function () {
  currentOrderSystem = {
    display: sinon.stub()
  };
  this.orderSystem = currentOrderSystem;
});