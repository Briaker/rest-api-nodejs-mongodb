const BookModel = require("#app/models/BookModel");
const UserModel = require("#app/models/UserModel");
const crudGenerator = require("#tests/helpers/crudGenerator");

const testData = {
  create: {
    title: "The Price Is Right for Dummies",
    description: "Guaranteed to increase your chance to win a new car!",
    isbn: "1972to2021",
    user: new UserModel({
      firstName: "Bob",
      lastName: "Barker",
      email: "bob.barker@thepriceisright.com",
      password: "spadeandneuter"
    }),
  },
  update: {
    description: "Guaranteed to increase your chance to win at Plinko!"
  },
};

crudGenerator(BookModel, testData);
