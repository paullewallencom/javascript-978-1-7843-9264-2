'use strict';

var newOrderDAO = require('../lib/orderDao'),
    MongoClient = require('mongodb').MongoClient,
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

describe('An Order DAO', function () {
  var orderDB, config;
  before('connect to DB', function (done) {
    config = {
      port: 27017,
      name: 'order-db'
    };

    MongoClient.connect('mongodb://localhost:' + config.port + '/' + config.name,
        {db: {w: 1}},
        function (err, db) {
          if (err)
            return done(err);
          orderDB = db;
          done();
        }
    );
  });

  after('disconnect from DB', function () {
    orderDB.close();
  });

  beforeEach('clean orders', function (done) {
    orderDB.collection('orders').deleteMany({}, done);
  });

  var orderDAO;
  beforeEach('create dao', function () {
    orderDAO = newOrderDAO(config);
  });

  var theOrder, ordersCollection;
  beforeEach('create test data', function (done) {
    theOrder = {
      _id: new ObjectID(),
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
    };
    ordersCollection = orderDB.collection('orders');
    ordersCollection.insertMany([
      {
        _id: new ObjectID(),
        data: []
      },
      theOrder,
      {
        _id: new ObjectID(),
        data: [{
          beverage: {
            id: "expresso id",
            name: "Expresso",
            price: 1.50
          },
          quantity: 1
        }]
      }
    ], done);
  });

  describe('#byId', function () {
    it('will return the specified order', function (done) {
      var orderId = theOrder._id.toHexString();

      orderDAO.byId(orderId, assertThatSuccessWith(done, function (order) {
        expect(order).to.be.deep.equal({
          id: orderId,
          data: theOrder.data
        });
      }));
    });

    it('will return an error if the specified order does not exists', function (done) {
      var nonExistingId = new ObjectID().toHexString();

      orderDAO.byId(nonExistingId, assertThatFailsWith(done, function (err) {
        expect(err).to.exist;
        expect(err.toString())
            .to.match(/not found/i)
            .and.to.contain(nonExistingId);
      }));
    });
  });

  describe('#update', function () {
    it('will update the specified order', function (done) {
      var orderId = theOrder._id,
          expectedOrder = {
            id: orderId.toHexString(),
            data: theOrder.data.push({
              beverage: {
                id: "mocaccino id",
                name: "Mocaccino",
                price: 4.30
              },
              quantity: 4
            })
          };

      orderDAO.update(expectedOrder, function (err) {
        expect(err).not.to.exist;

        ordersCollection.findOne({
          _id: orderId
        }, assertThatSuccessWith(done, function (order) {
          expect(order).to.be.deep.equal({
            _id: orderId,
            data: expectedOrder.data
          });
        }));
      });
    });

    it('will create a new order if the specified order does not exists', function (done) {
      var orderId = new ObjectID(),
          expectedOrder = {
            id: orderId.toHexString(),
            data: [{
              beverage: {
                id: "mocaccino id",
                name: "Mocaccino",
                price: 4.30
              },
              quantity: 4
            }]
          };

      orderDAO.update(expectedOrder, function (err) {
        expect(err).not.to.exist;

        ordersCollection.findOne({
          _id: orderId
        }, assertThatSuccessWith(done, function (order) {
          expect(order).to.be.deep.equal({
            _id: orderId,
            data: expectedOrder.data
          });
        }));
      });
    });
  });
});