'use strict';

var chai = require('chai'),
    expect = chai.expect;

chai.use(require('chai-as-promised'));

before('create root page object', function () {
  this.ui = require('./support/ui')(3000, browser);
});

describe('An order-view reacts to navigation', function () {
  var orderView;
  beforeEach(function () {
    this.ui.goTo('order');

    this.ui.executeScript(function () {
      window.controller = {
        load: sinon.spy(),
        addBeverage: sinon.spy()
      };
    });

    orderView = this.ui.newOrderView();

    return orderView.init('.container', 'controller');
  });

  ['some/other/page', 'place/order/form'].forEach(function (newPage) {
    var newUrl;
    beforeEach(function () {
      newUrl = this.ui.uriFor(newPage);
    });

    describe('when redirectTo is called with the URL of ' + newPage, function () {
      beforeEach(function () {
        return orderView.redirectTo(newUrl);
      });

      it('the browser will not navigate', function () {
        return expect(orderView.isInitialized())
            .to.eventually.be.ok;
      });

      it('the url will change to the url of ' + newPage, function () {
        return expect(this.ui.currentUrl())
            .to.eventually.be.equal(newUrl);
      });

      it('a load request will be send to the controller for ' + newPage, function () {
        return this.ui.executeScript(function () {
          expect(controller.load).to.have.been.calledWith(arguments[0]);
        }, newUrl);
      });
    });

    describe('given there has been a redirection to ' + newPage + ', when the back button is pressed', function () {
      beforeEach(function () {
        orderView.redirectTo(newUrl);

        return this.ui.goBack();
      });

      it('the browser will not navigate', function () {
        return expect(orderView.isInitialized())
            .to.eventually.be.ok;
      });

      it('a load request will be send to the controller for the previous page', function () {
        return this.ui.executeScript(function () {
          expect(controller.load).to.have.been.calledWith(arguments[0]);
        }, this.ui.uriFor('order'));
      });
    });
  });
});
