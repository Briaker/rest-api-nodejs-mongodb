const { chai, server } = require("#tests/helpers/testConfig");
const UserModel = require("#app/models/UserModel");
const mailer = require("#app/helpers/mailer");
const dbHandler = require("#tests/helpers/dbHandler");
const sinon = require("sinon");

const sandbox = sinon.createSandbox();

describe("Auth", () => {
  before(async () => {
    await dbHandler.clearCollection(UserModel);

    const sendStub = (from, to, subject, html) => Promise.resolve();

    // const stubMailerTransport = require("nodemailer").createTransport("Stub");
    // const stubMailerTransport = {
    //   sendMail: (data, callback) => {
    //     const err = new Error("some error");
    //     callback(err, null);
    //   }
    // };
    sandbox.replace(mailer, "send", sendStub);
  });

  after(() => {
    sandbox.restore();
  });

  const testData = {
    firstName: "Bob",
    lastName: "Barker",
    email: "bob.barker@thepriceisright.com",
    password: "spadeandneuter"
  };

  /*
   * Test the /POST route
   */
  describe("/POST Register", () => {
    it("It should send validation error for Register", (done) => {
      chai
        .request(server)
        .post("/api/auth/register")
        .send({ email: testData.email })
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });
  });

  /*
   * Test the /POST route
   */
  describe("/POST Register", () => {
    it("It should Register user", (done) => {
      chai
        .request(server)
        .post("/api/auth/register")
        .send(testData)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property("message").eql("Registration Success.");
          testData._id = res.body.data._id;
          done();
        });
    });
  });

  /*
   * Test the /POST route
   */
  describe("/POST Login", () => {
    it("it should Send account not confirm notice.", (done) => {
      chai
        .request(server)
        .post("/api/auth/login")
        .send({ email: testData.email, password: testData.password })
        .end((err, res) => {
          res.should.have.status(401);
          res.body.should.have
            .property("message")
            .eql("Account is not confirmed. Please confirm your account.");
          done();
        });
    });
  });

  /*
   * Test the /POST route
   */
  describe("/POST Resend  Confirm OTP", () => {
    it("It should resend  confirm OTP", (done) => {
      chai
        .request(server)
        .post("/api/auth/resend-verify-otp")
        .send({ email: testData.email })
        .end((err, res) => {
          res.should.have.status(200);
          UserModel.findOne({ _id: testData._id }, "confirmOTP").then(
            (user) => {
              testData.confirmOTP = user.confirmOTP;
              done();
            }
          );
        });
    });
  });

  /*
   * Test the /POST route
   */
  describe("/POST Verify Confirm OTP", () => {
    it("It should verify confirm OTP", (done) => {
      chai
        .request(server)
        .post("/api/auth/verify-otp")
        .send({ email: testData.email, otp: testData.confirmOTP })
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });
  });

  /*
   * Test the /POST route
   */
  describe("/POST Login", () => {
    it("It should send validation error for Login", (done) => {
      chai
        .request(server)
        .post("/api/auth/login")
        .send({ email: testData.email })
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });
  });

  /*
   * Test the /POST route
   */
  describe("/POST Login", () => {
    it("it should Send failed user Login", (done) => {
      chai
        .request(server)
        .post("/api/auth/login")
        .send({ email: "admin@admin.com", password: "1234" })
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });

  /*
   * Test the /POST route
   */
  describe("/POST Login", () => {
    it("it should do user Login", (done) => {
      chai
        .request(server)
        .post("/api/auth/login")
        .send({ email: testData.email, password: testData.password })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property("message").eql("Login Success.");
          done();
        });
    });
  });
});
