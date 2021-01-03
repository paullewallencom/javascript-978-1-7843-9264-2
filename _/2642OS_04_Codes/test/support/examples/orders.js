var counter = 0;

function toCamelCase(actionName) {
  return actionName
      .split(/\s+/)
      .map(function (word, i) {
        if (i === 0)
          return word;
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join('');
}

function actionFactoryFor(order) {
  return {
    removeItem: function (index) {
      return {
        action: 'remove-beverage',
        target: order.id,
        parameters: {
          beverageRef: order.data[index].beverage.id
        }
      };
    },
    editItemQuantity: function (index) {
      var item = order.data[index];
      return {
        action: 'edit-beverage',
        target: order.id,
        parameters: {
          beverageRef: item.beverage.id,
          newQuantity: item.quantity
        }
      };
    },
    appendItem: function () {
      return {
        action: 'append-beverage',
        target: order.id,
        parameters: {
          beverageRef: null,
          quantity: 0
        }
      };
    },
    placeOrder: function () {
      return {
        action: 'place-order',
        target: order.id
      };
    }
  };
}

module.exports = {
  empty: function () {
    return {
      id: "<empty order>",
      data: []
    };
  },
  withItems: function (items) {
    counter++;
    return {
      id: "<non empty order " + counter + ">",
      data: items
    };
  },
actionsForOrderFrom: function (order, actionExamples) {
  var actionFactory = actionFactoryFor(order);

  return actionExamples.hashes().map(function (actionExample) {
    var actionName = toCamelCase(actionExample.action),
        forItems = actionExample['for items'];

    if (!forItems)
      return actionFactory[actionName]();

    return forItems.split(/\s*,\s*/).map(function (itemIndex) {
      return actionFactory[actionName](itemIndex - 1);
    });
  }).reduce(function (a, b) {
    // Flaten array
    return a.concat(b);
  }, []);
}
};