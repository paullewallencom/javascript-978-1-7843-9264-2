'use strict';

var newStorage = require('./storageDouble'),
    orderSystemWith = require('../../lib/orders'),
    DataTable = require('cucumber').Ast.DataTable,
    Row = DataTable.Row,
    order = require('./examples/orders'),
    error = require('./examples/errors');

function beverageExampleFactoryFor(beverageExamples) {
  var factory = {};
  beverageExamples.hashes().forEach(function (beverageExample) {
    var name = beverageExample.beverage,
        factoryName = name.toLowerCase(),
        price = Number(beverageExample.price);
    factory[factoryName] = function () {
      return {
        id: factoryName + " id",
        name: name,
        price: price
      };
    };
  });
  return factory;
}

module.exports = function (cb) {
  var world = {},
      orderStorage = newStorage(),
      messageStorage = newStorage();

  world.orderSystem = orderSystemWith({
    order: orderStorage.dao(),
    message: messageStorage.dao()
  });

  function asOrderItem(itemExample) {
    var regex = /\s*(\d+)\s*([^\s]+)\s*$/;
    var matches = regex.exec(itemExample.toLowerCase());
    if (!matches)
      throw new Error('<[' + itemExample + ']> is not an order item');
    return {
      beverage: world.beverageFactory[matches[2]](),
      quantity: Number(matches[1])
    };
  }

  world.currentOrderHasItems = function (itemExamples) {
    // By default, no messages
    world.alreadyExistsAnOrderWith(itemExamples, "");
  };

  world.currentOrderHasMessages = function (messagesExamples) {
    // We do not care about the items here!
    world.alreadyExistsAnOrderWith("", messagesExamples);
  };

  world.alreadyExistsAnOrderWith = function (itemExamples, messagesExamples) {
    world.order = orderStorage
        .alreadyContains(order.withItems(world.asItems(itemExamples)));
    // By default, and order has no pending messages
    world.orderMessages = messageStorage.alreadyContains({
      id: world.order.id,
      data: world.asMessages(messagesExamples)
    });
  };

  world.asMessages = function (messagesExamples) {
    if (!messagesExamples)
      return [];
    return messagesExamples.split(',').map(error.asMessage);
  };

  world.asActions = function (actionExamples) {
    return order.actionsForOrderFrom(world.order, actionExamples);
  };

  world.shopServesBeverages = function (beveragesExamples) {
    world.beverageFactory = beverageExampleFactoryFor(beveragesExamples);
  };

  world.asItems = function (itemExamples) {
    if (!itemExamples)
      return [];
    return itemExamples.split(',').map(asOrderItem);
  };

  world.dataTable = function (dataExamples) {
    var cucumberTable = DataTable();
    if (dataExamples.length === 0)
      return cucumberTable;
    var keys = Object.getOwnPropertyNames(dataExamples[0]);
    cucumberTable.attachRow(Row(keys));
    dataExamples.forEach(function (example) {
      var dataRow = keys.map(function (key) {
        return example[key];
      });
      cucumberTable.attachRow(Row(dataRow));
    });
    return cucumberTable;
  };

  cb(world); // We are done!
};