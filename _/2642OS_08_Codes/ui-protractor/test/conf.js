exports.config = {
  framework: 'mocha',
  mochaOpts: {
    ui: 'bdd',
    reporter: 'spec',
    timeout: 6000
  },
  //seleniumAddress: 'http://localhost:4444/wd/hub',
  specs: [
    './order_*.js'
  ],
  multiCapabilities: [
    // Does not work with Selenium Server 2.44.0, but it will do with 2.43.1
    //{
    //  browserName: 'phantomjs',
    //  "phantomjs.binary.path": require('phantomjs').path,
    //  shardTestFiles: true,
    //  maxInstances: 2
    //},
    {
      browserName: 'chrome',
      shardTestFiles: true,
      maxInstances: 2
    },
    {
      browserName: 'safari',
      shardTestFiles: true,
      maxInstances: 2,
      exclude: ['test/order_view_reacts_to_navigation.js']
    }//,
    // Does not work with Selenium Server 2.44.0
    //{
    //  browserName: 'firefox',
    //  shardTestFiles: true,
    //  maxInstances: 2
    //}
  ],
  onPrepare: function () {
    browser.ignoreSynchronization = true;
  }
};