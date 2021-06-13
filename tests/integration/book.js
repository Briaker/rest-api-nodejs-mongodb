const { chai, server } = require("#tests/helpers/testConfig");
const BookModel = require("#app/models/BookModel");
const dbHandler = require("#tests/helpers/dbHandler");

describe("Book", () => {
  before(async () => {
    await dbHandler.clearCollection(BookModel);
  });

  // Prepare data for testing
  const userTestData = {
    email: "bob.barker@thepriceisright.com",
    password: "spadeandneuter"
  };

  // Prepare data for testing
  const testData = {
    title: "testing book",
    description: "testing book desc",
    isbn: "3214htrff4",
  };

  /*
   * Test the /POST route
   */
  describe("/POST Login", () => {
    it("it should do user Login for book", (done) => {
      chai
        .request(server)
        .post("/api/auth/login")
        .send({ email: userTestData.email, password: userTestData.password })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property("message").eql("Login Success.");
          userTestData.token = res.body.data.token;
          done();
        });
    });
  });

  /*
   * Test the /POST route
   */
  describe("/POST Book Store", () => {
    it("It should send validation error for store book", (done) => {
      chai
        .request(server)
        .post("/api/book")
        .send()
        .set("Authorization", "Bearer " + userTestData.token)
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });
  });

  /*
   * Test the /POST route
   */
  describe("/POST Book Store", () => {
    it("It should store book", (done) => {
      chai
        .request(server)
        .post("/api/book")
        .send(testData)
        .set("Authorization", "Bearer " + userTestData.token)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property("message").eql("Book add Success.");
          done();
        });
    });
  });

  /*
   * Test the /GET route
   */
  describe("/GET All book", () => {
    it("it should GET all the books", (done) => {
      chai
        .request(server)
        .get("/api/book")
        .set("Authorization", "Bearer " + userTestData.token)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property("message").eql("Operation success");
          testData._id = res.body.data[0]._id;
          done();
        });
    });
  });

  /*
   * Test the /GET/:id route
   */
  describe("/GET/:id book", () => {
    it("it should GET the books", (done) => {
      chai
        .request(server)
        .get("/api/book/" + testData._id)
        .set("Authorization", "Bearer " + userTestData.token)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property("message").eql("Operation success");
          done();
        });
    });
  });

  /*
   * Test the /PUT/:id route
   */
  describe("/PUT/:id book", () => {
    it("it should PUT the books", (done) => {
      chai
        .request(server)
        .put("/api/book/" + testData._id)
        .send(testData)
        .set("Authorization", "Bearer " + userTestData.token)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property("message").eql("Book update Success.");
          done();
        });
    });
  });

  /*
   * Test the /DELETE/:id route
   */
  describe("/DELETE/:id book", () => {
    it("it should DELETE the books", (done) => {
      chai
        .request(server)
        .delete("/api/book/" + testData._id)
        .set("Authorization", "Bearer " + userTestData.token)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property("message").eql("Book delete Success.");
          done();
        });
    });
  });
});
