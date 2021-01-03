'use strict';

var chai = require('chai'),
    expect = chai.expect,
    Key = require('selenium-webdriver').Key;

chai.use(require('chai-as-promised'));

var driver;
before(function () {
  driver = this.driver;
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
  };

  before(function () {
    driver.get(this.uriForPage('order'));

    return driver.executeAsyncScript(function () {
      var newOrderView = require('order-view'),
          addBeverageForm = arguments[0],
          cb = arguments[1];

      window.controller = {
        addBeverage: sinon.spy()
      };

      newOrderView('.container', window.controller)
          .update({
            totalPrice: '0 $',
            items: [],
            addBeverageForm: addBeverageForm
          }, cb);
    }, addBeverageForm);
  });

  afterEach(function () {
    driver.findElement({
      css: '.container .order form.add-beverage input[name="beverage"]'
    }).clear();

    driver.findElement({
      css: '.container .order form.add-beverage input[name="quantity"]'
    }).clear();

    return driver.executeScript(function () {
      controller.addBeverage.reset();
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
        driver.findElement({
          css: '.container .order form.add-beverage input[name="beverage"]'
        }).sendKeys(enteredBeverage);

        driver.findElement({
          css: '.container .order form.add-beverage input[name="quantity"]'
        }).sendKeys(enteredQuantity);
      });

      it('when the user clicks the "add to order" button, ' +
      'an addBeverage request will be sent to the order with "' + example.title + '"', function () {
        driver.findElement({
          css: '.container .order form.add-beverage input[name="addToOrder"]'
        }).click();

        return driver.executeScript(function () {
          expect(controller.addBeverage)
              .to.have.been.calledWith(arguments[0]);
        }, expectedRequest);
      });

      ['beverage', 'quantity'].forEach(function (fieldName) {
        it('when the user press ENTER in the "' + fieldName + '" input, ' +
        'an addBeverage request will be sent to the order with "' + example.title + '"', function () {
          driver.findElement({
            css: '.container .order form.add-beverage input[name="' + fieldName + '"]'
          }).sendKeys(Key.ENTER);

          return driver.executeScript(function () {
            expect(controller.addBeverage)
                .to.have.been.calledWith(arguments[0]);
          }, expectedRequest);
        });
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