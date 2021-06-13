const sinon = require("sinon");
const expressValidator = require("express-validator");

const mailer = require("#app/helpers/mailer");
const UserModel = require("#app/models/UserModel");
const dbHandler = require("#tests/helpers/dbHandler");
const { chai, server } = require("#tests/helpers/testConfig");

const sandbox = sinon.createSandbox();

const testData = {
  firstName: "Bob",
  lastName: "Barker",
  email: "bob.barker@thepriceisright.com",
  password: "spadeandneuter"
};

const invalidTestData = {
  email: "bob.burgers@pattys.com",
  password: "spadeandneuter"
};

describe("Auth", () => {
  before(async () => {
    await dbHandler.clearCollection(UserModel);
    // eslint-disable-next-line no-unused-vars
    const sendStub = (from, to, subject, html) => Promise.resolve();
    sandbox.replace(mailer, "send", sendStub);
  });

  after(() => {
    sandbox.restore();
  });

  /*
   * Test the /POST route
   */
  describe("/POST Invalid Register", () => {
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
  describe("/POST Successful Register", () => {
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
  describe("/POST Invalid Existing Register", () => {
    it("It should send validation error for email already existing", (done) => {
      chai
        .request(server)
        .post("/api/auth/register")
        .send(testData)
        .end((err, res) => {
          res.should.have.status(400);
          res.should.have.nested.property("body.data[0].msg").eql("E-mail already in use");
          done();
        });
    });
  });


  describe("/POST Unconfirmed Login", () => {
    it("it should Send account not confirmed notice.", (done) => {
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


  describe("/POST Failed To Save User During OTP", () => {
    const save_error_sandbox = sinon.createSandbox();

    before(() => {
      save_error_sandbox.replace(UserModel.prototype, "save", (callback) => {callback("ERROR");});
    });

    after(() => {
      save_error_sandbox.restore();
    });

    it("It should notify that there was a server error", (done) => {
      // const userStub =
      chai
        .request(server)
        .post("/api/auth/resend-verify-otp")
        .send({ email: testData.email })
        .end((err, res) => {
          res.should.have.status(500);
          done();
        });
    });
  });


  describe("/POST Resend Confirm OTP", () => {
    it("it should resend confirm OTP", (done) => {
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


  describe("/POST Verify Confirm OTP Error", () => {
    const validate_error_sandbox = sinon.createSandbox();

    before(() => {
      validate_error_sandbox.stub(expressValidator, "validationResult").throws();
    });

    after(() => {
      validate_error_sandbox.restore();
    });

    it("It should return a server error", (done) => {
      chai
        .request(server)
        .post("/api/auth/verify-otp")
        .send({ email: testData.email, otp: testData.confirmOTP })
        .end((err, res) => {
          res.should.have.status(500);
          done();
        });
    });
  });


  describe("/POST Verify Confirm OTP Wrong Email", () => {
    it("It should return an email not found validation error", (done) => {
      chai
        .request(server)
        .post("/api/auth/verify-otp")
        .send({ email: invalidTestData.email, otp: testData.confirmOTP })
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });

  describe("/POST Verify Confirm OTP Wrong OTP", () => {
    it("It should return a invalid OTP validation error", (done) => {
      chai
        .request(server)
        .post("/api/auth/verify-otp")
        .send({ email: invalidTestData.email, otp: "xxxx" })
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });


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


  describe("/POST Resend Verify OTP", () => {
    it("It should notify that the account is already confirmed", (done) => {
      chai
        .request(server)
        .post("/api/auth/verify-otp")
        .send({ email: testData.email, otp: testData.confirmOTP })
        .end((err, res) => {
          res.should.have.status(401);
          res.should.have.nested.property("body.message").eql("Account already confirmed.");
          done();
        });
    });
  });


  describe("/POST Resend Confirmed OTP", () => {
    it("It should notify that the account is already confirmed", (done) => {
      chai
        .request(server)
        .post("/api/auth/resend-verify-otp")
        .send({ email: testData.email })
        .end((err, res) => {
          res.should.have.status(401);
          res.should.have.nested.property("body.message").eql("Account already confirmed.");
          done();
        });
    });
  });


  describe("/POST Invalid Resend Confirmed OTP", () => {
    it("It should notify that the email provided is not found", (done) => {
      chai
        .request(server)
        .post("/api/auth/resend-verify-otp")
        .send({ email: invalidTestData.email })
        .end((err, res) => {
          res.should.have.status(401);
          res.should.have.nested.property("body.message").eql("Specified email not found.");
          done();
        });
    });
  });

  describe("/POST Invalid Resend Confirmed OTP", () => {
    it("It should notify that the email provided is invalid", (done) => {
      chai
        .request(server)
        .post("/api/auth/resend-verify-otp")
        .send({ email: "" })
        .end((err, res) => {
          res.should.have.status(400);
          res.should.have.nested.property("body.data").that.has.lengthOf(2);
          done();
        });
    });
  });

  describe("/POST Invalid Resend Confirmed OTP", () => {
    const validate_error_sandbox = sinon.createSandbox();

    before(() => {
      validate_error_sandbox.stub(expressValidator, "validationResult").throws();
    });

    after(() => {
      validate_error_sandbox.restore();
    });

    it("It should return a server error", (done) => {
      chai
        .request(server)
        .post("/api/auth/resend-verify-otp")
        .send({ email: "" })
        .end((err, res) => {
          res.should.have.status(500);
          done();
        });
    });
  });


  describe("/POST Invalid Login", () => {
    it("it should send validation error for Login", (done) => {
      chai
        .request(server)
        .post("/api/auth/login")
        .send({ email: "" })
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });
  });


  describe("/POST Bad Login", () => {
    it("it should send failed user Login", (done) => {
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


  describe("/POST Successful Login", () => {
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
