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
  app.listen(8080, () => "server up");
}

require("../src/index").startCluster(startServer, app);
```

## output

```shell
> sysctl -n hw.ncpu
8

> start
> node test/server.js

master starting 8 workers
worker up 75455
worker up 75456
worker up 75457
worker up 75458
worker up 75460
worker up 75459
worker up 75461
worker up 75462
reload requested
worker down
worker up 75466
worker down
worker up 75467
worker down
worker up 75468
worker down
worker up 75469
worker down
worker up 75470
worker down
worker up 75471
worker down
worker up 75472
worker down
worker up 75473
reload complete
```
