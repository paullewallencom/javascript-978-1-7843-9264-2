'use strict';

var chai = require('chai'),
    expect = chai.expect;

chai.use(require('chai-as-promised'));

before('create root page object', function () {
  this.ui = require('./support/ui')(3000, browser);
});

describe('An order-view sends an "add beverage" request to the controller', function () {
  var addBeverageForm = {
    target: '/orders/items_2',
    method: 'POST',
    enabled: true,
    shown: true,
    fields: [
      {name: '__method', type: 'hidden', value: 'PUT'},
      {name: 'beverage', type: 'text', value: ''},
      {name: 'quantity', type: 'text', value: ''},
      {name: 'addToOrder', type: 'submit', value: 'Add to order'}
    ],
    messages: []
  }, orderView;

  before(function () {
    this.ui.goTo('order');

    this.ui.executeScript(function () {
      window.controller = {
        load: sinon.spy(),
        addBeverage: sinon.spy()
      };
    });

    orderView = this.ui.newOrderView();

    orderView.init('.container', 'controller');

    orderView.update({
      totalPrice: '0 $',
      items: [],
      addBeverageForm: addBeverageForm
    });

    this.form = orderView.addBeverageForm();
  });

  afterEach(function () {
    this.form.fieldWithName('beverage').clear();
    this.form.fieldWithName('quantity').clear();

    this.ui.executeScript(function () {
      window.controller.load.reset();
      window.controller.addBeverage.reset();
    });
  });

  function willSendAnAddBeverageRequest(example) {
    var enteredBeverage = example.input.beverage,
        enteredQuantity = example.input.quantity;
    describe('given that the user has entered ' + example.title, function () {
      var expectedRequest = {
        beverage: enteredBeverage,
        quantity: enteredQuantity,
        target: '/orders/items_2',
        method: 'PUT'
      };

      beforeEach(function () {
        this.form.fieldWithName('beverage').typeText(enteredBeverage);
        this.form.fieldWithName('quantity').typeText(enteredQuantity);
      });

      it('when the user clicks the "add to order" button, ' +
      'an addBeverage request will be sent to the order with "' + example.title + '"', function () {
        this.form.fieldWithName('addToOrder').click();

        return this.ui.executeScript(function () {
          expect(controller.addBeverage)
              .to.have.been.calledWith(arguments[0]);
        }, expectedRequest);
      });

      ['beverage', 'quantity'].forEach(function (fieldName) {
        it('when the user press ENTER in the "' + fieldName + '" input, ' +
            'an addBeverage request will be sent to the order with "' + example.title + '"', function () {
              this.form.fieldWithName(fieldName).pressKey('ENTER');

              return this.ui.executeScript(function () {
                expect(controller.addBeverage)
                    .to.have.been.calledWith(arguments[0]);
              }, expectedRequest);
            }
        )
        ;
      });
    });
  }

  [
    {
      title: '2 Capuccinos',
      input: {
        beverage: 'Cappuccino',
        quantity: '2'
      }
    },
    {
      title: '12 Expressos',
      input: {
        beverage: 'Expresso',
        quantity: '12'
      }
    },
    {
      title: 'nothing',
      input: {
        beverage: ' ',
        quantity: ' '
      }
    }
  ].forEach(willSendAnAddBeverageRequest);
});
