import { expect } from "chai";
import { RT, RecordFactory, RecordNode } from "../../src/r/R";
import { ElementType } from "../../src/r/definitions/elements";
import { ProjectFactory } from "../../src/r/recordFactories/ProjectFactory";
import projectJson from "./jsons/project.json";

describe ("r ProjectFactory tests", () => {
  it ("should add element record to a project", () => {
    const projectF = new ProjectFactory(projectJson);
    const idAndRecord = projectF.addElementRecord({ sceneIdOrAddress: 1684325255018, elementType: ElementType.character });
    expect(idAndRecord).to.not.be.undefined;
    const record = projectF.getDeepRecord(idAndRecord?.id as number);
    expect(record).to.not.be.undefined;
    expect(record?.props.element_type).to.be.equal(ElementType.character);
  });
});