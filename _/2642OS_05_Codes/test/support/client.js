'use strict';

var request = require('request'),
    Q = require('q');

module.exports = function (baseURL) {
  return {
    GET: function (resourcePath) {
      return Q.Promise(function (resolve, reject) {
        request({
          timeout: 500,
          uri: baseURL + resourcePath,
          method: 'GET',
          headers: {
            'Accept': 'application/hal+json'
          }
        }, function (error, response, body) {
          try {
            if (error)
              return reject(error);
            resolve({
              status: response.statusCode,
              body: body ? JSON.parse(body) : undefined
            });
          } catch (err) {
            reject(err);
          }
        });
      });
    }
  };
};