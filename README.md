# cluster-rolling-restart

Simple way to turn any express server into a cluster with support for rolling restart.

## test/server.js

```js
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

require("../src/index").startCluster(startServer, app);
```

## output

```shell
> sysctl -n hw.ncpu
8

> start
> node test/server.js

master starting 8 workers 🌎
worker up 77012
worker up 77013
worker up 77014
worker up 77015
worker up 77018
worker up 77016
worker up 77017
worker up 77019
reload requested 👍
worker down 🔻
worker up 77023
worker down 🔻
worker up 77024
worker down 🔻
worker up 77025
worker down 🔻
worker up 77026
worker down 🔻
worker up 77027
worker down 🔻
worker up 77028
worker down 🔻
worker up 77029
worker down 🔻
worker up 77030
reload complete ✅
```
