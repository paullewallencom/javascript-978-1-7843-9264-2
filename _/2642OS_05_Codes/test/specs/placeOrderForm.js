'use strict';

var chai = require('chai'),
    expect = chai.expect;

module.exports = function () {
  it('will have a self link', function () {
    return expect(this.placeOrderForm).to.eventually
        .have.deep.property('_links.self')
        .that.is.deep.equal({
          href: this.placeOrderFormURI
        });
  });

  it('will have the parent order as a target', function () {
    return expect(this.placeOrderForm).to.eventually
        .have.deep.property('_links.target')
        .that.is.deep.equal({
          href: this.orderURI
        });
  });

  it('will use the POST method when submitted', function () {
    return expect(this.placeOrderForm).to.eventually
        .have.property('method', 'POST');
  });

  it('will have a name property with value "place-order-form"', function () {
    return expect(this.placeOrderForm).to.eventually
        .have.property('name', 'place-order-form');
  });

  it('will have a status parameter with value "placed"', function () {
    return expect(this.placeOrderForm).to.eventually
        .have.property('parameters')
        .that.is.deep.equal({status: 'placed'});
  });
};