Feature: Customer displays order

  Part of the "Making an Order" epic

  As a Customer
  I want to display the order
  in order to review the contents of my order and its price easily

  Background:
    Given that the shop serves the following beverages:
      | beverage   | price |
      | Expresso   | 1.50  |
      | Mocaccino  | 2.30  |
      | Frapuccino | 4     |

  Scenario: Order is empty
    Given that the order is empty
    When the customer displays the order
    Then no order items will be shown
    And "0" will be shown as total price
    And there will only be possible to add a beverage

  Scenario Outline: Non empty order
    Given that the order contains the following "<items>"
    When the customer displays the order
    Then "<items>" will be shown as the order's content
    And "<expected price>" will be shown as total price
    And there will be possible to:
      | action             | for items   |
      | place order        |             |
      | append item        |             |
      | edit item quantity | <for items> |
      | remove item        | <for items> |

  Examples:
    | items                                 | for items | expected price |
    | 1 Expresso, 2 Mocaccino               | 1,2       | 6.1            |
    | 2 Mocaccino, 1 Expresso               | 1,2       | 6.1            |
    | 2 Frapuccino, 1 Mocaccino, 1 Expresso | 1,2,3     | 11.8           |

  Scenario Outline: Order has pending messages
    Given that the order has the following pending messages "<pending>"
    When the customer displays the order
    Then "<pending>" messages will be shown
    And there will be no more pending messages

  Examples:
    | pending                                    |
    | bad quantity '-1'                          |
    | beverage does not exist, bad quantity '-1' |