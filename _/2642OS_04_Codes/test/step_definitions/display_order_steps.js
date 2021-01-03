'use strict';

var chai = require('chai'),
    expect = chai.expect,
    sugar = require('../support/cucumber_sugar');

chai.use(require("sinon-chai"));
chai.use(require("chai-as-promised"));

module.exports = function () {
  var Given = this.Given,
      When = this.When,
      Then = this.Then;

  this.World = require("../support/world.js");

  Given("that the shop serves the following beverages:", sugar(function (beveragesExamples) {
    this.shopServesBeverages(beveragesExamples);
  }));

  var theOrderContains = sugar(function (orderItemExamples) {
    this.currentOrderHasItems(orderItemExamples);
  });

  Given('that the order contains the following "$items"', theOrderContains);

  When('the customer displays the order', sugar(function () {
    this.result = this.orderSystem.display(this.order.id);
  }));

  var theFollowingItemsAreShown = sugar(function (orderItemExamples) {
    return expect(this.result).to.eventually
        .have.property('items')
        .that.is.deep.equal(this.asItems(orderItemExamples));
  });

  Then('"$items" will be shown as the order\'s content', theFollowingItemsAreShown);

  Then('"$price" will be shown as total price', sugar(function (expectedTotalPrice) {
    return expect(this.result).to.eventually
        .have.property('totalPrice')
        .that.is.equal(Number(expectedTotalPrice));
  }));

  var thereWillBePossibleTo = sugar(function (actionExamples) {
    var expectedActions = this.asActions(actionExamples);

    return expect(this.result).to.eventually
        .have.property('actions')
        .that.have.length(expectedActions.length)
        .and.that.deep.include.members(expectedActions);
  });
  Then('there will be possible to:', thereWillBePossibleTo);

  Given('that the order is empty', function (cb) {
    theOrderContains.call(this, "", cb);
  });

  Then('no order items will be shown', function (cb) {
    theFollowingItemsAreShown.call(this, "", cb);
  });

  Then('there will only be possible to add a beverage', function (cb) {
    thereWillBePossibleTo.call(this, this.dataTable([
      {action: 'append item'}
    ]), cb);
  });

  var orderHasPendingMessages = sugar(function (messages) {
    this.currentOrderHasMessages(messages);
  });
  Given('that the order has the following pending messages "$messages"', orderHasPendingMessages);

  Then('"$messages" messages will be shown', sugar(function (messages) {
    return expect(this.result).to.eventually
        .have.property('messages')
        .that.is.deep.equal(this.asMessages(messages));
  }));

  Then('there will be no more pending messages', function (cb) {
    orderHasPendingMessages.call(this, "", cb);
  });
};