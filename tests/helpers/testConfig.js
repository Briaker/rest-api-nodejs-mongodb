process.env.NODE_ENV = "test";

const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("#app/app");
chai.use(chaiHttp);
chai.should();

module.exports = {
  chai: chai,
  expect: chai.expect,
  server: server
};
