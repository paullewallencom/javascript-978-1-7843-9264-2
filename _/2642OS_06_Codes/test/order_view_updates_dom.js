'use strict';

var chai = require('chai'),
    expect = chai.expect;

chai.use(require('chai-as-promised'));

var driver;
before(function () {
  driver = this.driver;
});

describe('An order-view updates the DOM', function () {
  before(function () {
    driver.get(this.uriForPage('order'));

    return driver.executeScript(function () {
      window.view = require('order-view')('.container')
    });
  });

  function willUpdateTheDOM(example) {
    var viewModel = example.viewModel;

    describe('when update is called with ' + example.description, function () {
      beforeEach(function () {
        return driver.executeAsyncScript(function () {
          var viewModel = arguments[0],
              cb = arguments[1];

          view.update(viewModel, cb);
        }, viewModel);
      });

      it('will update the DOM to show the total price', function () {
        var priceElement = driver.findElement({
          css: '.container .order .price'
        });

        return expect(priceElement.getText())
            .to.eventually.be.equal(viewModel.totalPrice);
      });

      describe('will update the DOM to show the items', function () {
        it('there is one entry per each item', function () {
          var itemElements = driver.findElements({
            css: '.container .order .item'
          });

          return expect(itemElements).to.eventually
              .have.length(viewModel.items.length);
        });

        viewModel.items.forEach(function (itemModel, i) {
          var itemSelector = '.container .order .item:nth-of-type(' + (i + 1) + ')';

          it('the DOM for item ' + i + ' shows the item name', function () {
            var itemNameElement = driver.findElement({
              css: itemSelector + ' .name'
            });

            return expect(itemNameElement.getText())
                .to.eventually.be.equal(itemModel.name);
          });

          it('the DOM for item ' + i + ' shows the item quantity', function () {
            var itemQuantityElement = driver.findElement({
              css: itemSelector + ' .quantity'
            });

            return expect(itemQuantityElement.getText())
                .to.eventually.be.equal(itemModel.quantity);
          });

          it('the DOM for item ' + i + ' shows the item price', function () {
            var itemPriceElement = driver.findElement({
              css: itemSelector + ' .price'
            });

            return expect(itemPriceElement.getText())
                .to.eventually.be.equal(itemModel.unitPrice);
          });
        });
      });

      describe('will update the DOM to show the add beverage action', function () {
        var formModel = viewModel.addBeverageForm;
        describe('there is a form', function () {
          beforeEach(function () {
            this.form = driver.findElement({
              css: '.container .order form.add-beverage'
            });
          });

          it('with a ' + formModel.method + ' method', function () {
            return expect(this.form.getAttribute('method'))
                .to.eventually.be.equal(formModel.method.toLowerCase());
          });

          it('with action set to ' + formModel.target, function () {
            return expect(this.form.getAttribute('action'))
                .to.eventually.match(new RegExp(formModel.target + '$'));
          });

          it('which is ' + (formModel.shown ? '' : 'not ') + 'visible', function () {
            return expect(this.form.isDisplayed())
                .to.eventually.be.equal(formModel.shown);
          });

          if (formModel.shown) {
            formModel.messages.forEach(function (msg, i) {
              it('with an error message [' + msg + ']', function () {
                var msgElement = this.form.findElement({
                  css: '.error-msg:nth-of-type(' + (i + 1) + ')'
                });

                return expect(msgElement.getText())
                    .to.eventually.equal(msg);
              });
            });
          }

          formModel.fields.forEach(function (fieldModel) {
            describe('with a field named ' + fieldModel.name, function () {
              beforeEach(function () {
                this.field = this.form.findElement({
                  css: 'input[name="' + fieldModel.name + '"]'
                });
              });

              it('that has type [' + fieldModel.type + ']', function () {
                return expect(this.field.getAttribute('type'))
                    .to.eventually.be.equal(fieldModel.type);
              });

              it('that has value [' + fieldModel.value + ']', function () {
                return expect(this.field.getAttribute('value'))
                    .to.eventually.be.equal(fieldModel.value);
              });

              it('that is ' + (fieldModel.error ? '' : 'not ') + 'highlighted as error', function () {
                var className = this.field.getAttribute('class');

                if (fieldModel.error)
                  return expect(className)
                      .to.eventually.include('error');
                else
                  return expect(className)
                      .to.eventually.not.to.include('error');
              });

              it('that is ' + (formModel.enabled ? 'enabled' : 'disabled'), function () {
                var disabled = driver.executeScript(function () {
                  var inputEl = arguments[0];
                  return inputEl.disabled;
                }, this.field);

                return expect(disabled).to.eventually
                    .be.equal(!formModel.enabled);
              });
            });
          });
        });
      });
    });
  }

  [
    {
      description: 'an order with 3 items',
      viewModel: {
        totalPrice: '12.34 $',
        items: [
          {name: 'Expresso', quantity: '2', unitPrice: '2.33 $'},
          {name: 'Mocaccino', quantity: '3', unitPrice: '1.45 $'},
          {name: 'Latte', quantity: '1', unitPrice: '2.00 $'}
        ],
        addBeverageForm: {
          target: '/orders/items_3',
          method: 'POST',
          enabled: true,
          shown: true,
          fields: [
            {name: '__method', type: 'hidden', value: 'PUT'},
            {name: 'beverage', type: 'text', value: '', error: true},
            {name: 'quantity', type: 'text', value: '1', error: false},
            {name: 'addToOrder', type: 'submit', value: 'Add to order'}
          ],
          messages: ['name of the beverage is required']
        }
      }
    },
    {
      description: 'an order with 1 item',
      viewModel: {
        totalPrice: '15.46 $',
        items: [
          {name: 'Kaffee', quantity: '3', unitPrice: '5.43 $'},
          {name: 'Latte', quantity: '5', unitPrice: '2.10 $'}
        ],
        addBeverageForm: {
          target: '/orders/items_2',
          method: 'POST',
          enabled: false,
          shown: true,
          fields: [
            {name: '__method', type: 'hidden', value: 'PUT'},
            {name: 'beverage', type: 'text', value: 'Expresso'},
            {name: 'quantity', type: 'text', value: '10'},
            {name: 'addToOrder', type: 'submit', value: 'Add to order'}
          ],
          messages: []
        }
      }
    }
  ].forEach(willUpdateTheDOM);
});
