'use strict';

var chai = require('chai'),
    expect = chai.expect,
    Q = require('q');

chai.use(require("sinon-chai"));
chai.use(require("chai-as-promised"));

function commonFailureScenarios(example) {
  describe('GET ' + example.resource + ' fails:', function () {
    context('The order does not exists', function () {
      beforeEach(function () {
        this.orderSystem.display
            .withArgs(example.orderId)
            .returns(Q.fulfill(null));

        this.response = this.GET(this.ordersBaseURI + example.uri);
      });
      it('will respond with a 404 code', function () {
        return expect(this.response).to.eventually
            .have.property('status', 404);
      });
    });

    context('The order subsystem is down', function () {
      beforeEach(function () {
        this.orderSystem.display
            .withArgs(example.orderId)
            .returns(Q.reject(new Error('Expected error')));

        this.response = this.GET(this.ordersBaseURI + example.uri);
      });
      it('will respond with a 500 code', function () {
        return expect(this.response).to.eventually
            .have.property('status', 500);
      });
    });
  });
}

[
  {
    resource: "/order/:orderId",
    orderId: "<some order id>",
    uri: '/%3Csome%20order%20id%3E'
  },
  {
    resource: "/order/:orderId/create-form",
    orderId: "<some order>",
    uri: '/%3Csome%20order%3E/create-form'
  },
  {
    resource: "/order/:orderId/place-order-form",
    orderId: "order-id",
    uri: '/order-id/place-order-form'
  }
].forEach(commonFailureScenarios);