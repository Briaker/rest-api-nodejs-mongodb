const dbHandler = require("#tests/helpers/dbHandler");

before(async () => {
  console.log("DB connecting");
  await dbHandler.connect();
});

after(async () => {
  console.log("DB closing");
  await dbHandler.closeDatabase();
});

describe("Unit Tests", () => {
  require("#tests/unit/auth");
  require("#tests/unit/book");
});

describe("Integration Tests", () => {
  require("#tests/integration/auth");
  require("#tests/integration/book");
});
