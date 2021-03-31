const express = require("express");
const app = express();

app.get("/", (req, res) => res.send(`Hi from pid ${process.pid}`));

app.get("/reload", (req, res) => {
  res.send("performing rolling restart of cluster");
  process.send({ cmd: "reload" });
});

function startServer() {
  app.listen(8080, () => console.log("server up http://localhost:8080"));
}

require("../index").startCluster(startServer, 1000);
