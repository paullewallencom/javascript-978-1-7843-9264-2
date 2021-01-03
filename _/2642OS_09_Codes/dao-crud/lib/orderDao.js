'use strict';

var mongodb = require('mongodb'),
    MongoClient = mongodb.MongoClient,
    ObjectID = mongodb.ObjectID;

function withCollection(config, collectionName) {
  return function (command, cb) {
    MongoClient.connect('mongodb://localhost:' + config.port + '/' + config.name + '?w=1',
        function (err, db) {
          if (err) {
            console.log(err);
            return cb(err);
          }

          try {
            command(db.collection(collectionName), function (err, result) {
              db.close(function () {
                cb(err, result);
              });
            });
          } catch (e) {
            console.log(e);
            cb(e);
            db.close(cb);
          }
        }
    );
  };
}
function newDAO(withOrders) {
  return {
    byId: function (id, cb) {
      withOrders(function (orders, cb) {
        orders.findOne({
          _id: new ObjectID(id)
        }, function (err, orderDoc) {
          if (err) {
            console.log(err);
            return cb(err);
          }
          if (!orderDoc)
            return cb(new Error('Order [' + id + '] not found'));
          cb(null, {
            id: id,
            data: orderDoc.data
          });
        });
      }, cb);
    },
    update: function (entity, cb) {
      withOrders(function (orders, cb) {
        orders.save({
          _id: new ObjectID(entity.id),
          data: entity.data
        }, cb);
      }, cb);
    },
    removeAll: function (cb) {
      withOrders(function (orders, cb) {
        orders.deleteMany({}, cb);
      }, cb);
    }
  };
}

module.exports = function (config) {
  return newDAO(withCollection(config, 'orders'));
};