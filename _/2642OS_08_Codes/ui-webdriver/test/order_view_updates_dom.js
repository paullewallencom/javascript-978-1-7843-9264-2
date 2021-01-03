'use strict';

var chai = require('chai'),
    expect = chai.expect;

chai.use(require('chai-as-promised'));

module.exports = function (browserName) {
  describe('[' + browserName + '] An order-view updates the DOM', function () {
    var orderView;
    before(function () {
      this.ui.goTo('order');

      orderView = this.ui.newOrderView();

      return orderView.init('.container');
    });

    function willUpdateTheDOM(example) {
      var viewModel = example.viewModel;

      describe('when update is called with ' + example.description, function () {
        beforeEach(function () {
          return orderView.update(viewModel);
        });

        it('will update the DOM to show the total price', function () {
          return expect(orderView.totalPrice())
              .to.eventually.be.equal(viewModel.totalPrice);
        });

        describe('will update the DOM to show the items', function () {
          var itemViews;
          beforeEach(function () {
            itemViews = orderView.items();
          });

          it('there is one entry per each item', function () {
            return expect(itemViews.size()).to.eventually
                .be.equal(viewModel.items.length);
          });

          viewModel.items.forEach(function (itemModel, i) {
            // Slightly faster,We save two tests per item! -> save two set ups!
            // Less verbose
            it("the DOM for item " + i + " shows the item's information", function () {
              return expect(itemViews.info(i))
                  .to.eventually.be.deep.equal(itemModel);
            });
          });
        });

        describe('will update the DOM to show the add beverage action', function () {
          var formModel = viewModel.addBeverageForm;
          describe('there is a form', function () {
            beforeEach(function () {
              this.form = orderView.addBeverageForm();
            });

            it('with a ' + formModel.method + ' method', function () {
              return expect(this.form.method())
                  .to.eventually.be.equal(formModel.method);
            });

            it('with action set to ' + formModel.target, function () {
              return expect(this.form.target())
                  .to.eventually.match(new RegExp(formModel.target + '$'));
            });

            it('which is ' + (formModel.shown ? '' : 'not ') + 'visible', function () {
              return expect(this.form.isShown())
                  .to.eventually.be.equal(formModel.shown);
            });

            if (formModel.shown) {
              formModel.messages.forEach(function (msg, i) {
                it('with an error message [' + msg + ']', function () {
                  return expect(this.form.errorMessage(i))
                      .to.eventually.equal(msg);
                });
              });
            }

            formModel.fields.forEach(function (fieldModel) {
              var fieldName = fieldModel.name;
              describe('with a field named ' + fieldName, function () {
                beforeEach(function () {
                  this.field = this.form.fieldWithName(fieldName);
                });

                it('that has type [' + fieldModel.type + ']', function () {
                  return expect(this.field.type())
                      .to.eventually.be.equal(fieldModel.type);
                });

                it('that has value [' + fieldModel.value + ']', function () {
                  return expect(this.field.value())
                      .to.eventually.be.equal(fieldModel.value);
                });

                it('that is ' + (fieldModel.error ? '' : 'not ') + 'highlighted as error', function () {
                  return expect(this.field.isMarkedAsError())
                      .to.eventually.be.equal(!!fieldModel.error);
                });

                it('that is ' + (formModel.enabled ? 'enabled' : 'disabled'), function () {
                  return expect(this.field.isEnabled())
                      .to.eventually.be.equal(formModel.enabled);
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
};
