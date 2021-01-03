'use strict';

var newOrderDAO = require('../lib/orderDao'),
    ObjectID = require('mongodb').ObjectID,
    expect = require('chai').expect;

function assertThatSuccessWith(done, assertion) {
  return function (err, result) {
    if (err)
      return done(err);
    try {
      assertion(result);
      done();
    } catch (e) {
      done(e);
    }
  };
}

function assertThatFailsWith(done, assertion) {
  return function (err) {
    try {
      assertion(err);
      done();
    } catch (e) {
      done(e);
    }
  };
}

function newId() {
  return new ObjectID().toHexString();
}

var orders = [
  {
    id: newId(),
    data: []
  },
  {
    id: newId(),
    data: [
      {
        beverage: {
          id: "expresso id",
          name: "Expresso",
          price: 1.50
        },
        quantity: 3
      },
      {
        beverage: {
          id: "capuccino id",
          name: "Capuccino",
          price: 2.50
        },
        quantity: 1
      }
    ]
  },
  {
    id: newId(),
    data: [{
      beverage: {
        id: "expresso id",
        name: "Expresso",
        price: 1.50
      },
      quantity: 1
    }]
  }
];

describe('An Order DAO', function () {
  var orderDAO;
  beforeEach(function () {
    orderDAO = newOrderDAO({
      port: 27017,
      name: 'order-db'
    });
  });

  describe('Given that there are no orders', function () {
    beforeEach(function (done) {
      orderDAO.removeAll(done);
    });

    function updateAndFindSpec(order) {
      it('when we ask the DAO to retrieve order "' + order.id + '", then an error will be returned', function (done) {
        orderDAO.byId(order.id, assertThatFailsWith(done, function (err) {
          expect(err).to.exist;
          expect(err.toString())
              .to.match(/not found/i)
              .and.to.contain(order.id);
        }));
      });

      it('when we ask the DAO to update order "' + order.id + '", ' +
      'then the order "' + order.id + '" can be retrieved', function (done) {
        orderDAO.update(order, function (err) {
          expect(err).not.to.exist;

          orderDAO.byId(order.id, assertThatSuccessWith(done, function (result) {
            expect(result).to.be.deep.equal(order);
          }));
        });
      });
    }

    orders.forEach(updateAndFindSpec);
  });

  describe('Given that we have created three orders', function () {
    orders.forEach(function (order) {
      beforeEach('insert order "' + order.id + '"', function (done) {
        orderDAO.update(order, done);
      });
    });

    orders.forEach(function (order) {
      it('when the DAO is asked to update "' + order.id + '", ' +
      'it will return the new data when retrieved', function (done) {
        var newOrderData = {
          id: order.id,
          data: order.data.push({
            beverage: {
              id: "latte id",
              name: "Latte",
              price: 2.45
            },
            quantity: 3
          })
        };

        orderDAO.update(newOrderData, function (err) {
          expect(err).not.to.exist;

          orderDAO.byId(order.id, assertThatSuccessWith(done, function (result) {
            expect(result).to.be.deep.equal(newOrderData);
          }));
        });
      });
    });

    describe('when the DAO is asked to remove them all', function () {
      beforeEach(function (done) {
        orderDAO.removeAll(done);
      });

      function assertOrderIsRemoved(order) {
        it('when we ask the DAO to retrieve order "' + order.id + '", ' +
        'then an error will be returned', function (done) {
          orderDAO.byId(order.id, assertThatFailsWith(done, function (err) {
            expect(err).to.exist;
            expect(err.toString())
                .to.match(/not found/i)
                .and.to.contain(order.id);
          }));
        });
      }

      orders.forEach(assertOrderIsRemoved);
    });
  });
});