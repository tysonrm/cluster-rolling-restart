"use strict";

const cluster = require("cluster");
const numCores = require("os").cpus().length;
let reloading = false;
let reloadList = [];
let workerList = [];

/**
 * Start a new worker,
 * listen for a reload request from it,
 * add it to `workerList` which is used during the rolling restart.
 */
function startWorker() {
  const worker = cluster.fork();

  worker.on("message", function (message) {
    if (message.cmd === "reload") {
      console.log("reload requested 👍");
      if (reloading) {
        console.log("reload already in progress");
        return;
      }
      reloading = true;
      reloadList = [...workerList];
      workerList = [];
      const worker = reloadList.pop();
      worker.kill("SIGTERM");
    }
  });

  workerList.push(worker);
}

/**
 * Gracefully stop a worker on the reload list.
 */
function stopWorker(waitms = 2000) {
  const worker = reloadList.pop();
  if (worker) setTimeout(() => worker.kill("SIGTERM"), waitms);
  else {
    reloading = false;
    console.log("reload complete ✅");
  }
}

/**
 * Checks status of reload
 * @returns {boolean} true to continue, otherwise stop
 */
function continueReload() {
  return reloading;
}

/**
 * Runs a copy of `startService` on each core of the machine.
 * Processes share the server port and requests are distributed
 * round-robin.
 *
 * ```js
 * const cluster = require("cluster-rolling-restart");
 * const express = require("express");
 * const app = express();
 *
 * app.get("/", (req, res) => res.send(`I'm pid ${process.pid}`));
 *
 * app.get("/reload", (req, res) => process.send({ cmd: "reload" }));
 *
 * cluster.startCluster(() => app.listen(8080));
 * ```
 *
 * @param {function(app)} startService - a callback that starts your app
 * @param {number} [waitms] - Wait `waitms` milliseconds between start
 * and stop to allow time for your app to come up. Default is 2000 ms.
 */
module.exports.startCluster = function (startService, waitms = 2000) {
  if (cluster.isMaster) {
    // Worker stopped. If reloading, start a new one.
    cluster.on("exit", function (worker) {
      console.log("worker down", worker.process.pid);
      if (continueReload()) {
        startWorker();
      }
    });

    // Worker started. If reloading, stop the next one.
    cluster.on("online", function (worker) {
      console.log("worker up", worker.process.pid);
      if (continueReload()) {
        stopWorker(waitms);
      }
    });

    console.log(`master starting ${numCores} workers 🌎`);
    // Run a copy of this program on each core
    for (let i = 0; i < numCores; i++) {
      startWorker();
    }
  } else {
    // this is a worker, run the service.
    startService();
  }
};
