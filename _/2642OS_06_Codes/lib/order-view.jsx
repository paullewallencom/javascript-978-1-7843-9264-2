/** @jsx React.DOM */

'use strict';

var React = require('react'),
    OrderView = require('./components/order.jsx');

function NOOP() {
}

module.exports = function (containerSelector, controller) {
  var onAddBeverage = NOOP;
  if (controller)
    onAddBeverage = controller.addBeverage.bind(controller);

  var view = React.renderComponent(
      <OrderView onAddBeverage={onAddBeverage}/>,
      document.querySelector(containerSelector)
  );

  return {
    update: view.setProps.bind(view)
  };
};