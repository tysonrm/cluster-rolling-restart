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

master starting 8 workers
worker up 75693
worker up 75692
worker up 75694
worker up 75695
worker up 75697
worker up 75696
worker up 75698
worker up 75699
reload requested
worker down
worker up 75702
worker down
worker up 75703
worker down
worker up 75704
worker down
worker up 75705
worker down
worker up 75706
worker down
worker up 75707
worker down
worker up 75708
worker down
worker up 75709
reload complete
```
