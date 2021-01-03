'use strict';

var chai = require('chai'),
    expect = chai.expect,
    Q = require('q'),
    isAPlaceOrderForm = require('./specs/placeOrderForm');

chai.use(require("sinon-chai"));
chai.use(require("chai-as-promised"));

describe('GET /order/:orderId/place-order-form', function () {
  beforeEach(function () {
    this.orderId = "<some order id>";
    this.orderURI = this.ordersBaseURI + '/' + encodeURIComponent(this.orderId);
    this.placeOrderFormURI = this.orderURI + '/place-order-form';

    this.orderModel = {};
    this.orderSystem.display
        .withArgs(this.orderId)
        .returns(Q.fulfill(this.orderModel));
  });

  it('and that there is no actions property, will respond with a 404 code', function () {
    return expect(this.GET(this.placeOrderFormURI)).to.eventually
        .have.property('status', 404);
  });

  context('and that there is a place-order action', function () {
    beforeEach(function () {
      this.orderModel.actions = [
        { action: 'place-order' }
      ];

      this.response = this.GET(this.placeOrderFormURI);
    });

    it('will respond with a 200 code', function () {
      return expect(this.response).to.eventually
          .have.property('status', 200);
    });

    describe('will respond with a HAL document for the form', function () {
      beforeEach(function () {
        this.placeOrderForm = this.response.then(function (response) {
          return response.body;
        });
      });
      isAPlaceOrderForm();
    });
  });

  it('and that there is no place-order action, will respond with a 404 code', function () {
    this.orderModel.actions = [
      { action: 'not-a-place-order-action' }
    ];

    return expect(this.GET(this.placeOrderFormURI)).to.eventually
        .have.property('status', 404);
  });
});