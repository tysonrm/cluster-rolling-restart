# cluster-rolling-restart

A simple way to turn express into a clustered server with support for rolling restart.

## install

```shell
npm install cluster-rolling-restart
```

## server.js

```js
const cluster = require("cluster-rolling-restart");
const express = require("express");
const app = express();

app.get("/", (req, res) => res.send(`<h1>Hi from pid ${process.pid}</h1>`));

app.get("/reload", (req, res) => {
  res.send("performing rolling restart of cluster");
  process.send({ cmd: "reload" });
});

function startServer(app) {
  app.listen(8080);
}

cluster.startCluster(startServer, app, 1000);
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

## trigger restart

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
