/** @jsx React.DOM */

'use strict';

var React = require('react'),
    OrderView = require('./components/order.jsx');

function NOOP() {
}

module.exports = function (containerSelector, controller) {
  window.addEventListener('popstate', function () {
    controller.load(window.document.location.href);
  });

  var view = React.renderComponent(
      <OrderView
          onAddBeverage={controller ? controller.addBeverage.bind(controller) : NOOP}/>,
      document.querySelector(containerSelector)
  );

  return {
    update: view.setProps.bind(view),
    redirectTo: function (newUrl) {
      window.history.pushState(null, null, newUrl);
      controller.load(window.document.location.href);
    }
  };
};