'use strict';

var chai = require('chai'),
    expect = chai.expect;

module.exports = {
  willBeACreateForm: function () {
    it('will have a self link', function () {
      return expect(this.createForm).to.eventually
          .have.deep.property('_links.self')
          .that.is.deep.equal({
            href: this.createFormURI
          });
    });

    it('will use the PUT method when submitted', function () {
      return expect(this.createForm).to.eventually
          .have.property('method', 'PUT');
    });

    it('will have a name property with value "create-form"', function () {
      return expect(this.createForm).to.eventually
          .have.property('name', 'create-form');
    });
  },
  willHaveTheRightParameters: function (example) {
    it('the form will have a beverageHref parameter with the URI of the specified beverage', function () {
      return expect(this.createForm).to.eventually.have.deep
          .property('parameters.beverageHref', example.expectedBeverageURI);
    });

    it('the form will have a quantity parameter with the specified quantity', function () {
      return expect(this.createForm).to.eventually.have.deep
          .property('parameters.quantity', example.expectedQuantity);
    });
  },
  willHaveTheRightTarget: function (example) {
    it('the target of the form will point to ' + example.expectedTarget, function () {
      return expect(this.createForm).to.eventually
          .have.deep.property('_links.target')
          .that.is.deep.equal({
            href: this.orderURI + example.expectedTarget
          });
    });
  }
};