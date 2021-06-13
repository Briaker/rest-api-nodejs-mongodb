#!/usr/bin/env node

const http = require("http");

// const debug = require("debug")("rest-api-nodejs-mongodb:server");

const app = require("../app");
const { normalizePort, onError, onListening } = require("../helpers/utility");
const initializeDbConnection = require("../helpers/dbConnection");

initializeDbConnection();

const port = normalizePort(process.env.PORT || "3000");
app.set("port", port);

const server = http.createServer(app);

server.listen(port);
server.on("error", onError);
server.on("listening", onListening);
