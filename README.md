# cluster-rolling-restart

Simple way to turn any express server into a cluster with support for rolling restart.

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
