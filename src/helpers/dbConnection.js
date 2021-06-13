const mongoose = require("mongoose");

const dbConnection = () => {
  const MONGODB_URL = process.env.MONGODB_URL;
  mongoose.connect(MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
    if(process.env.NODE_ENV !== "test") {
      console.log("Connected to %s", MONGODB_URL);
      console.log("App is running ... \n");
      console.log("Press CTRL + C to stop the process. \n");
    }
  })
    .catch(err => {
      console.error("App starting error:", err.message);
      process.exit(1);
    });
};

module.exports = dbConnection;
