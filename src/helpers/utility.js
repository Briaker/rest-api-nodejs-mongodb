const {name} = require("#/package.json");
const debug = require("debug")(`${name}:server`);

const getServerBinding = (server) => {
  const addr = server.address();
  return typeof addr === "string" ? `pipe ${addr}` : `port ${addr.port}`;
};

exports.randomNumber = (length) => {
  let text = "";
  const possible = "123456789";
  for (let i = 0; i < length; i++) {
    const sup = Math.floor(Math.random() * possible.length);
    text += i > 0 && sup == i ? "0" : possible.charAt(sup);
  }
  return Number(text);
};

exports.normalizePort = (val) => {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
};

exports.onError = (error, server) => {
  if (error.syscall !== "listen") {
    throw error;
  }

  var bind = getServerBinding(server);

  // handle specific listen errors with friendly messages
  switch (error.code) {
  case "EACCES":
    console.error(bind + " requires elevated privileges");
    process.exit(1);
    break;
  case "EADDRINUSE":
    console.error(bind + " is already in use");
    process.exit(1);
    break;
  default:
    throw error;
  }
};

exports.onListening = (server) => {
  debug(`Listening on ${getServerBinding(server)}`);
};
