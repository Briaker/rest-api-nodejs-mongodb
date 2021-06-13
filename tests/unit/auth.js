const UserModel = require("#app/models/UserModel");
const crudGenerator = require("#tests/helpers/crudGenerator");

const testData = {
  create: {
    firstName: "Bob",
    lastName: "Barker",
    email: "bob.barker@thepriceisright.com",
    password: "spadeandneuter"
  },
  update: {
    lastName: "Borker"
  },
}

crudGenerator(UserModel, testData);
