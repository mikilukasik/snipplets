const defaults = {
  isFailed: err => err,
  logger: () => { },
  adapt: {
    slowDown: {
      failedCount: 10,
      ms: 0,
    },
    speedUp: {
      successCount: 10,
      ms: 0,
    },
  },
};

const throttler = {
  defaults: {
    set(options) {
      Object.assign(defaults, options);
    },
  },
  create(_options) {
    const options = Object.assign({}, defaults, _options);
    options.type = (options.type || 'promise').toLowerCase();

    const queue = [];
    let successCount = 0;
    let failedCount = 0;
    let totalSuccessCount = 0;
    let totalFailedCount = 0;

    const adaptError = (err) => {
      failedCount += 1;
      totalFailedCount += 1;
      if (failedCount >= options.adapt.slowDown.failedCount) {
        failedCount = 0;
        successCount = 0;
        const oldDelay = options.delay;
        options.delay += options.adapt.slowDown.ms;
        if (options.maxDelay && options.delay > options.maxDelay) options.delay = options.maxDelay;
        if (options.delay !== oldDelay) options.logger(`Slowing down throttler on error.. ${JSON.stringify({ throttlerId: options.id, err, delay: options.delay, successCount, failedCount, q: queue.length }, null, 2)}`);
      }
    };

    const adaptSuccess = () => {
      successCount += 1;
      totalSuccessCount += 1;
      if (successCount >= options.adapt.speedUp.successCount) {
        failedCount = 0;
        successCount = 0;
        const oldDelay = options.delay;
        options.delay -= options.adapt.speedUp.ms;
        if (options.delay < 0) options.delay = 0;
        if (options.minDelay && options.delay < options.minDelay) options.delay = options.minDelay;
        if (options.delay !== oldDelay) options.logger(`Speeding up throttler on success.. ${JSON.stringify({ throttlerId: options.id, delay: options.delay, successCount, failedCount, q: queue.length }, null, 2)}`);
      }
    };

    const startWorker = () => {
      const worker = {
        idle: true,
      };
      worker.doWork = () => {
        worker.idle = false;
        const job = queue.shift();
        if (!job) {
          worker.idle = true;
          return;
        }

        const dealWithRes = (err, res) => {
          if (options.isFailed(err, res, { successCount, failedCount, totalSuccessCount, totalFailedCount })) {
            adaptError(err);
          } else {
            adaptSuccess();
          }

          setTimeout(worker.doWork, options.delay);
          job.cb(err, res);
        };

        // Callback type
        if (options.type === 'callback') return options.fn(...job.args, dealWithRes);

        // Promise type
        options.fn(...job.args).then(
          (res) => dealWithRes(null, res),
          (err) => dealWithRes(err)
        );
      };

      return worker;
    };

    const workers = [...new Array(options.threads)].map(startWorker);

    const startIdleWorkers = () => {
      workers.forEach(worker => {
        if (worker.idle) worker.doWork();
      });
    };

    const fn = (...args) => {
      if (options.type === 'callback') {
        const cb = args.pop();
        queue.push({ args, cb });
        startIdleWorkers();
        return;
      }

      return new Promise((resolve, reject) => {
        const cb = (err, res) => err && reject(err) || resolve(res);
        queue.push({ args, cb });
        startIdleWorkers();
      });
    };

    return fn;
  },
};

module.exports = throttler;