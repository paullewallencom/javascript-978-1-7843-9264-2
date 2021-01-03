var validatorWith = require('./validator'),
    nonPositiveValidationRule = require('./rules/nonPositive'),
    nonDivisibleValidationRule = require('./rules/nonDivisible');

var ruleFactoryMap = {
  nonPositive: function () {
    return nonPositiveValidationRule;
  },
  nonDivisible: function (options) {
    return nonDivisibleValidationRule(options.divisor, options.error);
  }
};

function toValidatorRule(ruleDescription) {
  return ruleFactoryMap[ruleDescription.type](ruleDescription.options);
}

module.exports = function (findConfiguration) {
  return function (ruleSetName) {
    return validatorWith(findConfiguration(ruleSetName).map(toValidatorRule));
  };
};