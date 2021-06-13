const dbHandler = require("#tests/helpers/dhHandler");


describe('Unit Tests ', () => {
  before(async () => {
    await dbHandler.connect();
  });

  afterEach(async () => {
    await dbHandler.clearCollections();
  });

  after(async () => {
    await dbHandler.closeDatabase();
  });

  require("#tests/unit/auth");
  require("#tests/unit/book");
});

// describe('Integration Tests ', () => {
//   before(async () => {
//     await dbHandler.connect();
//   });
//
//   after(async () => {
//     await dbHandler.closeDatabase();
//   });
//
//   require("#tests/integration/auth");
//   require("#tests/integration/book");
// });
