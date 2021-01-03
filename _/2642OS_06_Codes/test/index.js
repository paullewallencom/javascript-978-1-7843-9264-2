'use strict';

var express = require('express'),
    port = process.env.PORT || 3000,
    server,
    app = express(),
    browserify = require('browserify'),
    reactify = require('reactify'),
    bundles = {},
    webdriver = require('selenium-webdriver');

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

  app.listen(port, function () {
    server = this;
    cb.apply(this, arguments);
  });
});

before('attach test utils', function () {
  this.uriForPage = function (name) {
    return 'http://localhost:' + port + '/test/' + name + '.html';
  };
});

before('start web driver session', function () {
  this.driver = new webdriver.Builder().
      withCapabilities(webdriver.Capabilities.chrome()).
      build();
});

after('quit web driver session', function () {
  return this.driver.quit();
});

after('stop web server', function (cb) {
  if (!server)
    return cb();
  server.close(function () {
    server = null;
    cb();
  });
});