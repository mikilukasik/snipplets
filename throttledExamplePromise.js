// this file is an example on how to use the throttler
const throttler = require('./throttler');

// example function that has a callback as last argument, callback takes (err, res)
// could be request.get, or solr.search
const _get = (a, b) => {
  if (Math.random() > 0.02) return new Promise(res => setTimeout(() => res('success'), 1000));
  return new Promise((resolve, reject) => setTimeout(() => reject(new Error('test error')), 1000));
};

// don't need to set defaults, all this can be defined in the argument of throttler.create
throttler.defaults.set({
  // type: 'callback',         // default value is 'promise'
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
  get('some', 'arguments').then(
    res => console.log({i, res})
  ).catch(
    err => console.log({i, err})
  );
};

