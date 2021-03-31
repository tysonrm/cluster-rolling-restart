const cluster = require("../index");
const express = require("express");
const app = express();

app.get("/", (req, res) => res.send(`I'm pid ${process.pid}`));

app.get("/reload", (req, res) => process.send({ cmd: "reload" }));

cluster.startCluster(() => app.listen(8080));
