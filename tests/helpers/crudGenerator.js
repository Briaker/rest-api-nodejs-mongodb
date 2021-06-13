const {expect} = require("#tests/helpers/testConfig");
const dbHandler = require("#tests/helpers/dbHandler");

const crudGenerator = (Model, testData) => {
  let testId;

  describe(`CRUD tests for ${Model.modelName}`, () => {
    before(async () => {
      await dbHandler.clearCollections();
    });

    it("create", async () => {
      const instance = await Model.create(testData.create);
      testId = instance._id;
      expect(instance).to.exist;
    });

    it("read", async () => {
      const instance = await Model.findById(testId);
      expect(instance).to.exist;
      expect(instance._id.equals(testId)).to.be.true;
    });

    it("update", async () => {
      const instance = await Model.findByIdAndUpdate(testId, testData.update, {new: true});
      expect(instance).to.exist;
      expect(instance._id.equals(testId)).to.be.true;
      expect(instance.toObject()).to.include(testData.update);
    });

    it("deletes", async () => {
      const instance = await Model.findByIdAndDelete(testId);
      expect(instance).to.exist;
      expect(instance._id.equals(testId)).to.be.true;
      expect(instance.toObject()).to.include(testData.update);
    });
  });
};

module.exports = crudGenerator;
