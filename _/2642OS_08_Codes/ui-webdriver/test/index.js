'use strict';

var express = require('express'),
    port = process.env.PORT || 3000,
    server,
    app = express(),
    browserify = require('browserify'),
    reactify = require('reactify'),
    bundles = {},
    webdriver = require('selenium-webdriver'),
    newPageObject = require('./support/ui'),
    SeleniumServer = require('selenium-webdriver/remote').SeleniumServer,
    seleniumServer;

before('start selenium server', function () {
  seleniumServer = new SeleniumServer(__dirname +
  '/../selenium-server-standalone-2.43.1.jar', {
    port: 4444
  });

  return seleniumServer.start();
});

after('stop selenium server', function () {
  return seleniumServer.stop();
});

function registerBundle(name, cb) {
  return function (err, buf) {
    if (err)
      return cb(err);
    bundles[name] = buf.toString();
    cb();
  };
}

before('pack react', function (cb) {
  var reactFileName = require.resolve('react/dist/react.js');
  browserify({
    noParse: [reactFileName]
  })
      .require(reactFileName, {expose: 'react'})
      .bundle(registerBundle('react', cb));
});

before('pack order-view', function (cb) {
  var viewFileName = require.resolve('../lib/order-view.jsx');

  browserify()
      .transform(reactify)
      .require(viewFileName, {expose: 'order-view'})
      .add(viewFileName)
      .exclude('react')
      .bundle(registerBundle('order-view', cb));
});

before('start web server', function (cb) {
  app.use(express.static(__dirname + '/..'));

  app.get('/dist/:bundleName.js', function (req, res) {
    var bundle = bundles[req.param('bundleName')];
    if (!bundle)
      return res.sendStatus(404);
    res.set('Content-Type', 'application/json');
    res.send(bundle);
  });

  app.listen(port, function (err) {
    server = this;
    cb.apply(this, arguments);
  });
});

[
// Note: Firefox will fail if use version below 2.45.0
// webdriver.Capabilities.firefox(),
  webdriver.Capabilities.phantomjs()
      .set('phantomjs.binary.path', require('phantomjs').path),
  webdriver.Capabilities.chrome(),
  webdriver.Capabilities.safari()
].forEach(function (capability) {
      var browserName = capability.get(webdriver.Capability.BROWSER_NAME),
          driver;

      describe('Test suite for [' + browserName + ']', function () {
        before('start web driver session [' + browserName + ']', function () {
          driver = new webdriver.Builder()
              .usingServer(seleniumServer.address())
              .withCapabilities(capability)
              .build();

          this.ui = newPageObject(port, driver);
        });

        require('./order_view_updates_dom')(browserName);
        require('./order_view_fires_addBeverage')(browserName);
        if (browserName !== 'safari') {
          // Selenium Server 2.44 or below do not support History API for Safari
          require('./order_view_reacts_to_navigation')(browserName);
        }

        after('quit web driver session [' + browserName + ']', function () {
          return driver.quit();
        });
      });
    });

after('stop web server', function (cb) {
  if (!server)
    return cb();
  server.close(function () {
    server = null;
    cb();
  });
});