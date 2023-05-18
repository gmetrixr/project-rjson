import { expect } from "chai";
import { RT, createRecord } from "../../src/r/R";

describe ("r RecordFactory tests", () => {
  it ("should create a new project", () => {
    const project = createRecord(RT.project);
    expect(project.type).to.be.equal("project");
  });
});