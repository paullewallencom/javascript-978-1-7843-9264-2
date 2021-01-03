'use strict';

function simpleDiffReport(cb) {
  return function (err) {
    if (err) {
      if (typeof err.expected !== 'undefined' &&
          typeof err.actual !== 'undefined') {
        var errMsg = [];
        errMsg.push('Expected:');
        errMsg.push(JSON.stringify(err.expected));
        errMsg.push('Actual:');
        errMsg.push(JSON.stringify(err.actual));
        errMsg.push(err.stack);
        cb(errMsg.join('\r\n'));
      } else
        cb(err);
    } else
      cb();
  };
}

module.exports = function (stepHandler) {
  return function () {
    var cb = simpleDiffReport(arguments[arguments.length - 1]);

    try {
      var result = stepHandler.apply(this, arguments);

      if (result && typeof result.then === 'function') {
        result.then(function (ignoredParam) {
          cb()
        }, cb);
      } else
        cb();
    } catch (err) {
      cb(err);
    }
  };
};