#!/usr/bin/env node

const http = require("http");

const app = require("#app/app");
const { normalizePort, onError, onListening } = require("#app/helpers/utility");
const initializeDbConnection = require("#app/helpers/dbConnection");

initializeDbConnection();

const port = normalizePort(process.env.PORT || "3000");
app.set("port", port);

const server = http.createServer(app);

server.listen(port);
server.on("error", (error) => { onError(error, server); });
server.on("listening", () => { onListening(server); });
