'use strict';

var mongodb = require('mongodb'),
    MongoClient = mongodb.MongoClient,
    ObjectID = mongodb.ObjectID;

function withCollection(config, collectionName) {
  return function (command, cb) {
    MongoClient.connect('mongodb://localhost:' + config.port + '/' + config.name,
        {db: {w: 1}},
        function (err, db) {
          if (err)
            return cb(err);

          try {
            command(db.collection(collectionName), function () {
              try {
                cb.apply(this, arguments);
              } finally {
                db.close();
              }
            });
          } catch (e) {
            cb(e);
            db.close();
          }
        }
    );
  };
}
function newDAO(withOrders) {
  return {
    byId: function (id, cb) {
      withOrders(function (orders) {
        orders.findOne({
          _id: new ObjectID(id)
        }, function (err, orderDoc) {
          if (err)
            return cb(err);
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
      withOrders(function (orders) {
        orders.save({
          _id: new ObjectID(entity.id),
          data: entity.data
        }, cb);
      }, cb);
    }
  };
}

module.exports = function (config) {
  return newDAO(withCollection(config, 'orders'));
};