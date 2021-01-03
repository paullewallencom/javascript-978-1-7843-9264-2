module.exports = function (validationRules) {
  return function (n) {
    return validationRules.reduce(function (result, rule) {
      rule(n, result);
      return result;
    }, []);
  };
};