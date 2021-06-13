const dbHandler = require("#tests/helpers/dbHandler");
require("#tests/helpers/integrationInitializer");

before(async () => {
  await dbHandler.connect();
});

after(async () => {
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
