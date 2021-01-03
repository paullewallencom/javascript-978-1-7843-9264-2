'use strict';

var express = require('express'),
    port = process.env.PORT || 3000,
    app = express(),
    browserify = require('browserify'),
    reactify = require('reactify'),
    bundles = {};

function registerBundle(name) {
  return function (err, buf) {
    if (err)
      return console.log(err);
    bundles[name] = buf.toString();
  };
}

var reactFileName = require.resolve('react/dist/react.js');
browserify({
  noParse: [reactFileName]
})
    .require(reactFileName, {expose: 'react'})
    .bundle(registerBundle('react'));

var viewFileName = require.resolve('../../lib/order-view.jsx');

browserify()
    .transform(reactify)
    .require(viewFileName, {expose: 'order-view'})
    .add(viewFileName)
    .exclude('react')
    .bundle(registerBundle('order-view'));

app.use(express.static(__dirname + '/../..'));

app.get('/dist/:bundleName.js', function (req, res) {
  var bundle = bundles[req.param('bundleName')];
  if (!bundle)
    return res.sendStatus(404);
  res.set('Content-Type', 'application/json');
  res.send(bundle);
});

app.listen(port, function (err) {
  if (err)
    return console.log(err);
  console.log('test server open');
});