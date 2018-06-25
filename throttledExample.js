// this file is an example on how to use the throttler
const throttler = require('./throttler');

// example function that has a callback as last argument, callback takes (err, res)
// could be request.get, or solr.search
const _get = (a, b, cb) => {
  if (Math.random() > 0.02) return setTimeout(() => cb(null, 'success'), 1000);
  setTimeout(() => cb(new Error('test error')), 1000);
};

// don't need to set defaults, all this can be defined in the argument of throttler.create
throttler.defaults.set({
  type: 'callback',         // default value is 'promise'
  fn: _get,                 // the function to be throttled
  threads: 5,               // maximum number of simultaneous calls
  delay: 10,                // initial (idle) delay between calls
  minDelay: 2,
  maxDelay: 2000,
  isFailed: (err, res) => err,    // optional, return true to treat response as failed.
  logger: console.log,
  adapt: {
    slowDown: {
      failedCount: 1,             // will slow down at every failed request
      ms: 100
    },
    speedUp: {
      successCount: 30,           // will speed up after 30 continous success
      ms: 20
    }
  }
});

const get = throttler.create({ id: 'getter' });   // ATM ({ id }) is only used in logging, but could be mandatory later to use like throttler.instances.getter

for (let i = 0; i < 300; i += 1){
  get('some', 'arguments', (err, res) => {        // flood it with requests
    console.log({i, err, res});                   // see them throttled
  });
};

