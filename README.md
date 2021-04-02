# cluster-rolling-restart

A simple way to turn express into a clustered server with support for rolling restart and cache synchronization.

## Install

![<img src="npm.png">](https://www.npmjs.com/package/cluster-rolling-restart)

```shell
npm install cluster-rolling-restart
```

## server.js

```js
const cluster = require("cluster-rolling-restart");
const express = require("express");
const app = express();

app.get("/", (req, res) => res.send(`I'm pid ${process.pid}`));
app.get("/reload", (req, res) => process.send({ cmd: "reload" }));
app.get("/reload-reset", (req, res) => process.send({ cmd: "reload-reset" }));

cluster.startCluster(() => app.listen(8080));
```

## output

```shell
> sysctl -n hw.ncpu
8

> start
> node server.js

master starting 8 workers 🌎
worker up 77653
worker up 77655
worker up 77652
worker up 77654
worker up 77658
worker up 77657
worker up 77656
worker up 77659
```

## request restart

```shell
> curl http://localhost:8080/reload
```

## output

```shell
reload requested 👍
worker down 77659
worker up 77662
worker down 77658
worker up 77663
worker down 77657
worker up 77664
worker down 77656
worker up 77665
worker down 77655
worker up 77666
worker down 77654
worker up 77667
worker down 77653
worker up 77668
worker down 77652
worker up 77669
reload complete ✅
```

## Using Cache Synchronization

To use cache synchronization, you send the data you want to cache to the master process. You then listen for events from the master, and when a `saveCommand` event arrives, you update your cache with the data in the event.

Send data to save to master...

```js
 async save(id, data) {
    if (clusterEnabled) {
      process.send({
        cmd: "saveBroadcast",
        pid: process.pid,
        id,
        data,
        name: this.name,
      });
    }
    return this.dataSource.set(id, data).get(id);
  }
```

Listen for save event and update cache...

```js
process.on("message", ({ cmd, id, pid, data, name }) => {
  if (cmd && id && data && process.pid !== pid) {
    if (cmd === "saveCommand") {
      const ds = DataSourceFactory.getDataSource(name);
      ds.clusterSave(id, ModelFactory.loadModel(observer, ds, data, name));
      return;
    }
    if (cmd === "deleteCommand") {
      const ds = DataSourceFactory.getDataSource(name);
      ds.clusterDelete(id);
      return;
    }
  }
});
```
