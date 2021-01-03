'use strict';

var chai = require('chai'),
    expect = chai.expect,
    newStorage = require('./support/storageDouble'),
    order = require('./support/examples/orders'),
    errors = require('./support/examples/errors'),
    orderSystemWith = require('../lib/orders');

chai.use(require("sinon-chai"));
chai.use(require("chai-as-promised"));

describe('Customer displays order', function () {
  beforeEach(function () {
    this.orderStorage = newStorage();
    this.messageStorage = newStorage();
    this.orderSystem = orderSystemWith({
      order: this.orderStorage.dao(),
      message: this.messageStorage.dao()
    });
  });
  context('Given that the order is empty', function () {
    beforeEach(function () {
      this.order = this.orderStorage.alreadyContains(order.empty());
      this.messages = this.messageStorage.alreadyContains({
        id: this.order.id,
        data: []
      });
      this.messageStorage.updateWillNotFail();

      this.result = this.orderSystem.display(this.order.id);
    });
    it('will show no order items', function () {
      return expect(this.result).to.eventually
          .have.property('items').that.is.empty;
    });
    it('will show 0 as total price', function () {
      return expect(this.result).to
          .eventually.have.property('totalPrice').that.is.equal(0);
    });
    it('will only be possible to add a beverage', function () {
      return expect(this.result).to.eventually
          .have.property('actions')
          .that.is.deep.equal([
            {
              action: 'append-beverage',
              target: this.order.id,
              parameters: {
                beverageRef: null,
                quantity: 0
              }
            }
          ]);
    });
  });

  function scenarioOrderContainsBeverages(testExample) {
    context('Given that the order contains ' + testExample.title, function () {
      beforeEach(function () {
        this.order = this.orderStorage.alreadyContains(order.withItems(testExample.items));
        this.messages = this.messageStorage.alreadyContains({
          id: this.order.id,
          data: []
        });
        this.messageStorage.updateWillNotFail();
        this.orderActions = order.actionsFor(this.order);

        this.result = this.orderSystem.display(this.order.id);
      });
      it('will show one item per beverage', function () {
        return expect(this.result).to.eventually
            .have.property('items')
            .that.is.deep.equal(this.order.data);
      });
      it('will show the sum of the unit prices as total price', function () {
        return expect(this.result).to
            .eventually.have.property('totalPrice')
            .that.is.equal(testExample.expectedTotalPrice);
      });
      it('will be possible to place the order', function () {
        return expect(this.result).to.eventually
            .have.property('actions')
            .that.include(this.orderActions.place());
      });
      it('will be possible to add a beverage', function () {
        return expect(this.result).to.eventually
            .have.property('actions')
            .that.include(this.orderActions.appendItem());
      });
      testExample.items.forEach(function (itemExample, i) {
        it('will be possible to remove the ' + itemExample.beverage, function () {
          return expect(this.result).to.eventually
              .have.property('actions')
              .that.include(this.orderActions.removeItem(i));
        });
        it('will be possible to change the quantity of ' + itemExample.beverage, function () {
          return expect(this.result).to.eventually
              .have.property('actions')
              .that.include(this.orderActions.editItemQuantity(i));
        });
      });
    });
  }

  [
    {
      title: '1 Expresso and 2 Mocaccino',
      items: [
        {beverage: 'expresso', quantity: 1},
        {beverage: 'mocaccino', quantity: 2}
      ],
      expectedTotalPrice: 6.10
    },
    {
      title: '1 Mocaccino, 2 expressos, and 1 capuccino',
      items: [
        {beverage: 'mocaccino', quantity: 1},
        {beverage: 'expresso', quantity: 2},
        {beverage: 'capuccino', quantity: 1}
      ],
      expectedTotalPrice: 7.30
    }
  ].forEach(scenarioOrderContainsBeverages);

  function scenarioOrderHasPendingMessages(testExample) {
    context('Given that the order has pending the following messages: ' + testExample.title, function () {
      beforeEach(function () {
        this.order = this.orderStorage.alreadyContains(order.empty());
        this.messages = this.messageStorage.alreadyContains({
          id: this.order.id,
          data: testExample.pendingMessages
        });
        this.messageStorage.updateWillNotFail();

        this.result = this.orderSystem.display(this.order.id);

        return this.result;
      });
      it('will show the pending messages', function () {
        return expect(this.result).to.eventually
            .have.property('messages')
            .that.is.deep.equal(this.messages.data);
      });
      it('there will be no more pending messages', function () {
        this.messageStorage.toExpectUpdate({
          id: this.order.id,
          data: []
        });
      });
    });
  }

  [
    {
      title: 'bad quantity[-1]',
      pendingMessages: [errors.badQuantity(-1)]
    },
    {
      title: 'beverage does not exist, bad quantity[0]',
      pendingMessages: [
        errors.beverageDoesNotExist(),
        errors.badQuantity(-1)
      ]
    }
  ].forEach(scenarioOrderHasPendingMessages);
});