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
>sysctl -n hw.ncpu
8

> start
> node test/server.js

master starting 8 workers
worker up 74642
worker up 74640
worker up 74641
worker up 74644
worker up 74643
worker up 74646
worker up 74647
worker up 74645
reload requested
worker down
worker up 74650
worker down
worker up 74651
worker down
worker up 74652
worker down
worker up 74653
worker down
worker up 74654
worker down
worker up 74655
worker down
worker up 74656
worker down
reload complete
```
