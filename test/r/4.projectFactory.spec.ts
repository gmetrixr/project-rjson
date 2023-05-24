import { expect } from "chai";
import { RT, RecordFactory, RecordNode, createRecord } from "../../src/r/R";
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

  it ("should add record to a project", () => {
    const projectF = new ProjectFactory(projectJson);
    const r = createRecord(RT.element);
    const idAndRecord = projectF.addRecord({ record: r, parentIdOrAddress: 1684325255018 });
    expect(idAndRecord).to.not.be.undefined;
    const record = projectF.getDeepRecord(idAndRecord?.id as number);
    expect(record).to.not.be.undefined;
    expect(record?.props.element_type).to.be.equal(ElementType.character);
  });

  it ("should delete record from a project", () => {
    const projectF = new ProjectFactory(projectJson);
    projectF.deleteRecord(1684405505170);
    const scene = projectF.getRecord(1684405505170);
    expect(scene).to.be.undefined;
    const menuRecordMap = projectF.getRecordMap(RT.menu);
    console.log("=============> menu record map: ", menuRecordMap);
    const thenAction = projectF.getDeepRecord(1684409594263);
    console.log("=============> then action: ", thenAction);
    //@ts-ignore
    expect(thenAction).to.be.undefined;
  });
});