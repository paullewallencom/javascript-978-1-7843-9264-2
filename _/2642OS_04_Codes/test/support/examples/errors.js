var errorExampleFactory = {
  asMessage: function (messageExample) {
    var regex = /\s*([^']+)('[^']+')?\s*$/;
    var matches = regex.exec(messageExample);
    if (!matches)
      throw new Error('<[' + itemExample + ']> is not a message');
    var factoryName = matches[1].replace(/\s+$/, ''),
        factory = errorExampleFactory[factoryName];
    if (typeof factory !== 'function')
      throw new Error('<[' + factoryName + ']> is an unknown message');

    return factory(matches[2]);
  },
  'bad quantity': function (params) {
    return {
      key: "error.quantity",
      params: params
    };
  },
  'beverage does not exist': function () {
    return {
      key: "error.beverage.notExists"
    };
  }
};

module.exports = errorExampleFactory;