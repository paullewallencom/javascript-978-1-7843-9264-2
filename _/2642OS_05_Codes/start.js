var orderSystemWith = require('mycafe-core'),
    express = require('express'),
    routes = require('./index'),
    port = process.argv[2] || 9090,
    app = express();

function inMemoryDAO(data) {
  return {
    byId: function (id, cb) {
      setImmediate(function () {
        cb(null, data[id]);
      });
    },
    update: function (entity, cb) {
      setImmediate(function () {
        data[entity.id] = entity.data;
        cb(null);
      });
    }
  }
}

var orders = {},
    messages = {},
    orderSystem = orderSystemWith({
      order: inMemoryDAO(orders),
      message: inMemoryDAO(messages)
    });

orders['1'] = [
  { beverage: { beverage: 'Frapuccino', price: 4, id: 'b1' }, quantity: 2 },
  { beverage: { beverage: 'Mocaccino', price: 2.3, id: 'b2' }, quantity: 1 },
  { beverage: { beverage: 'Expresso', price: 1.5, id: 'b3' }, quantity: 1 }
];

messages['1'] = [
  { key: "error.beverage.notExists" },
  { key: "error.quantity", params: [-1]}
];

app
    .use('/orders', routes.order(orderSystem))
    .listen(port, function (err) {
      if (err)
        return console.log('Error starting the server', err);
      console.log('Server running on port:', port);
    });