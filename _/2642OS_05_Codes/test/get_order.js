'use strict';

var chai = require('chai'),
    expect = chai.expect,
    Q = require('q'),
    aCreateForm = require('./specs/createForm'),
    isAPlaceOrderForm = require('./specs/placeOrderForm');

chai.use(require("sinon-chai"));
chai.use(require("chai-as-promised"));

describe('GET /order/:orderId', function () {
  beforeEach(function () {
    this.orderId = "<some order id>";
    this.orderURI = this.ordersBaseURI + '/' + encodeURIComponent(this.orderId);

    this.orderModel = {};
    this.orderSystem.display
        .withArgs(this.orderId)
        .returns(Q.fulfill(this.orderModel));
  });

  it('will respond with a 200 code', function () {
    return expect(this.GET(this.orderURI)).to.eventually
        .have.property('status', 200);
  });

  describe('will respond with a HAL document for the order', function () {
    it('will have a self link', function () {
      return expect(this.GET(this.orderURI)).to.eventually
          .have.deep.property('body._links.self')
          .that.is.deep.equal({
            href: this.orderURI
          });
    });
    describe('will have a totalPrice property', function () {
      it('with 0 as default value', function () {
        return expect(this.GET(this.orderURI)).to.eventually
            .have.deep.property('body.totalPrice', 0);
      });
      it('with the total price of the order', function () {
        this.orderModel.totalPrice = 222;

        return expect(this.GET(this.orderURI)).to.eventually
            .have.deep.property('body.totalPrice', this.orderModel.totalPrice);
      });
    });
    describe('will have a messages property', function () {
      it('with an empty array as default value', function () {
        return expect(this.GET(this.orderURI)).to.eventually
            .have.deep.property('body.messages')
            .that.is.an('array').empty;
      });
      it('with the pending messages of the order', function () {
        this.orderModel.messages = ['msg1', 'msg2'];

        return expect(this.GET(this.orderURI)).to.eventually
            .have.deep.property('body.messages')
            .that.is.deep.equal(this.orderModel.messages);
      });
    });

    it('given that the order is empty, there will be no item links', function () {
      this.orderModel.items = [];

      return expect(this.GET(this.orderURI)).to.eventually
          .have.not.deep.property('body._links.item');
    });

    it('given that the order is not empty, there will be an item link for each item', function () {
      this.orderModel.items = ['itemX', 'itemY'];

      return expect(this.GET(this.orderURI)).to.eventually
          .have.deep.property('body._links.item')
          .that.has.length(this.orderModel.items.length)
          .and.that.include.deep.members([
            {href: this.orderURI + '/item_0'},
            {href: this.orderURI + '/item_1'}
          ]);
    });

    function willHaveALinkForTheAction(example) {
      var actionName = example.actionName,
          linkType = example.linkType;

      it('given that the order has not an ' + actionName + ' action,' +
      ' there will not be a link to a ' + linkType, function () {
        this.orderModel.actions = [
          {action: 'not-the-' + actionName + '-action'}
        ];

        return expect(this.GET(this.orderURI)).to.eventually
            .have.not.deep.property('body._links.' + linkType);
      });

      it('given that the order has a(n) ' + actionName + ' action,' +
      ' there will be a link to a ' + linkType, function () {
        this.orderModel.actions = [
          {action: actionName}
        ];

        return expect(this.GET(this.orderURI)).to.eventually
            .have.deep.property('body._links.' + linkType)
            .that.deep.equals({
              href: this.orderURI + '/' + linkType
            });
      });
    }

    [
      {actionName: 'append-beverage', linkType: 'create-form'},
      {actionName: 'place-order', linkType: 'place-order-form'}
    ].forEach(willHaveALinkForTheAction);

    describe('will embed the place-order-form resource', function () {
      beforeEach(function () {
        this.orderModel.actions = [
          {action: 'place-order'}
        ];
        this.response = this.GET(this.orderURI);
      });

      it('will have an embedded resource named place-order-form', function () {
        return expect(this.response).to.eventually
            .have.deep.property('body._embedded.place-order-form')
      });

      describe('the embedded resource will be a valid place-order-form', function () {
        beforeEach(function () {
          this.placeOrderFormURI = this.orderURI + '/place-order-form';

          this.placeOrderForm = this.response.then(function (response) {
            if (response.body && response.body._embedded)
              return response.body._embedded['place-order-form'];
          });
        });
        isAPlaceOrderForm();
      });
    });

    describe('will embed the create-form resource', function () {
      beforeEach(function () {
        this.orderModel.actions = [
          {action: 'append-beverage'}
        ];
      });

      it('will have an embedded resource named create-form', function () {
        return expect(this.GET(this.orderURI)).to.eventually
            .have.deep.property('body._embedded.create-form')
      });

      describe('the embedded resource will be a valid create-form', function () {
        var scenarioParameters = {
          items: ['itemX', 'itemY', 'itemZ'],
          expectedTarget: '/item_3',
          quantity: 3,
          beverageRef: '<some other beverage>',
          expectedQuantity: 3,
          expectedBeverageURI: '/beverages/%3Csome%20other%20beverage%3E'
        };
        beforeEach(function () {
          this.createFormURI = this.orderURI + '/create-form';
          this.orderModel.items = scenarioParameters.items;
          this.orderModel.actions[0].parameters = {
            beverageRef: scenarioParameters.beverageRef,
            quantity: scenarioParameters.quantity
          };
          this.createForm = this
              .GET(this.orderURI)
              .then(function (response) {
                if (response.body && response.body._embedded)
                  return response.body._embedded['create-form'];
              });
        });
        aCreateForm.willBeACreateForm();
        aCreateForm.willHaveTheRightParameters(scenarioParameters);
        aCreateForm.willHaveTheRightTarget(scenarioParameters);
      });
    });
  });
});