'use strict';

var chai = require('chai'),
    expect = chai.expect,
    Q = require('q'),
    aCreateForm = require('./specs/createForm');

chai.use(require("sinon-chai"));
chai.use(require("chai-as-promised"));

describe('GET /order/:orderId/create-form', function () {
  beforeEach(function () {
    this.orderId = "<some order id>";
    this.orderURI = this.ordersBaseURI + '/' + encodeURIComponent(this.orderId);
    this.createFormURI = this.orderURI + '/create-form';

    this.orderModel = {};

    this.orderSystem.display
        .withArgs(this.orderId)
        .returns(Q.fulfill(this.orderModel));
  });

  it('and that there is no actions property, will respond with a 404 code', function () {
    return expect(this.GET(this.createFormURI)).to.eventually
        .have.property('status', 404);
  });

  context('and that there is a append-beverage action', function () {
    beforeEach(function () {
      this.orderModel.actions = [
        { action: 'append-beverage' }
      ];
    });

    it('will respond with a 200 code', function () {
      return expect(this.GET(this.createFormURI)).to.eventually
          .have.property('status', 200);
    });

    describe('will respond with a HAL document for the form', function () {
      beforeEach(function () {
        this.createForm = this
            .GET(this.createFormURI)
            .then(function (response) {
              return response.body;
            });
      });
      aCreateForm.willBeACreateForm();
    });

    function appendBeverageActionWithParametersScenario(example) {
      context('and the action has ' + example.description, function () {
        beforeEach(function () {
          this.orderModel.actions[0].parameters = {
            beverageRef: example.beverageRef,
            quantity: example.quantity
          };

          this.createForm = this
              .GET(this.createFormURI)
              .then(function (response) {
                return response.body;
              });
        });
        aCreateForm.willHaveTheRightParameters(example);
      });
    }

    [
      {
        description: 'no default beverage',
        quantity: 10, beverageRef: null,
        expectedQuantity: 10, expectedBeverageURI: null
      },
      {
        description: 'a default beverage',
        quantity: 2, beverageRef: '<some beverage>',
        expectedQuantity: 2, expectedBeverageURI: '/beverages/%3Csome%20beverage%3E'
      }
    ].forEach(appendBeverageActionWithParametersScenario);

    function appendBeverageFormTargetsNewItemURI(example) {
      context('given the order has ' + example.items.length + ' items', function () {
        beforeEach(function () {
          this.orderModel.items = example.items;

          this.createForm = this
              .GET(this.createFormURI)
              .then(function (response) {
                return response.body;
              });
        });
        aCreateForm.willHaveTheRightTarget(example);
      });
    }

    [
      {items: ['item0', 'item1'], expectedTarget: '/item_2'},
      {items: [], expectedTarget: '/item_0'}
    ].forEach(appendBeverageFormTargetsNewItemURI);
  });

  it('and that there is no append-beverage action, will respond with a 404 code', function () {
    this.orderModel.actions = [
      { action: 'not-an-append-beverage-action' }
    ];

    return expect(this.GET(this.createFormURI)).to.eventually
        .have.property('status', 404);
  });
});