const { chai, server } = require("#tests/helpers/testConfig");

describe("App", () => {
  describe("/GET Invalid Route", () => {
    it("it should return page not found error", (done) => {
      chai
        .request(server)
        .get("/does/not/exist")
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.have.property("message").eql("Page not found");
          done();
        });
    });
  });

  describe("/GET Invalid Route", () => {
    it("it should return page not found error", (done) => {
      chai
        .request(server)
        .post("/api/book")
        .end((err, res) => {
          res.should.have.status(401);
          res.body.should.have.property("message").eql("Page not found");
          done();
        });
    });
  });

});
