import { expect } from "chai";
import { RT, RecordFactory, RecordNode, createRecord, recordTypeDefinitions, rtp } from "../../src/r/R";
import projectJson from "./jsons/project.json";
import { projectPropertyDefaults } from "../../src/r/recordTypes/Project";

// To be imported from r/index once the errors are resolved
const r = {
  "record":   <T extends RT>(json: RecordNode<T>): RecordFactory<T> => new RecordFactory(json),
  // "project":  (json: RecordNode<RT.project>): RF.ProjectFactory => new RF.ProjectFactory(json),
  // "scene":    (json: RecordNode<RT.scene>): RF.SceneFactory => new RF.SceneFactory(json),
  // "element":  (json: RecordNode<RT.element>): RF.ElementFactory => new RF.ElementFactory(json),
}

describe ("r RecordFactory tests", () => {
  it ("should create a new project", () => {
    const project = createRecord(RT.project);
    expect(project.type).to.be.equal("project");
  });

  it ("should get project name" , () => {
    expect(r.record(projectJson).getName()).to.be.equal(projectJson.name);
  });

  it ("should get project props", () => {
    const props = r.record(projectJson).getProps();
    expect(props.length).to.be.equal(Object.keys(projectJson.props).length);
    expect(props[0]).to.be.equal(Object.keys(projectJson.props)[0]);
  });

  it ("should get all possible project props", () => {
    expect(r.record(projectJson).getAllPossibleProps().length).to.be.equal(Object.keys(projectPropertyDefaults).length);
  });

  it ("should get project property value", () => {
    expect(r.record(projectJson).get(rtp.project.show_menu)).to.be.equal(projectJson.props.show_menu);
  });

  it ("should set project property value", () => {
    const projectF = r.record(projectJson);
    projectF.set(rtp.project.auto_add_new_scene_to_menu, true);
    const autoAddNewSceneToMenu = projectF.get(rtp.project.auto_add_new_scene_to_menu);
    expect(autoAddNewSceneToMenu).to.be.equal(true);
  });

  it ("should reset project property value", () => {
    const projectF = r.record(projectJson);
    projectF.reset(rtp.project.show_menu);
    const showMenu = projectF.get(rtp.project.show_menu);
    expect(showMenu).to.be.equal(projectPropertyDefaults.show_menu);
  });

  it ("should delete project property", () => {
    const projectF = r.record(projectJson);
    projectF.delete(rtp.project.show_menu);
    const showMenu = projectF.get(rtp.project.show_menu);
    expect(showMenu).to.be.undefined;
  });

  it ("should get defined or default value for a project property", () => {
    expect(r.record(projectJson).getValueOrDefault(rtp.project.auto_add_new_scene_to_tour_mode)).to.be.equal(projectPropertyDefaults.auto_add_new_scene_to_tour_mode);
  });

  it ("should get a clone default value for a project property", () => {
    expect(r.record(projectJson).getDefault(rtp.project.auto_add_new_scene_to_menu)).to.be.equal(projectPropertyDefaults.auto_add_new_scene_to_menu);
  });

  it ("should get record types for a project", () => {
    const recordTypes = r.record(projectJson).getRecordTypes();
    expect(recordTypes.length).to.be.equal(Object.keys(projectJson.records).length);
    for (const type of recordTypes) {
      expect(recordTypeDefinitions).have.property(type);
    }
  });

  it ("should get record map of types for a project", () => {
    const recordMapOfType = r.record(projectJson).getRecordMapOfType(RT.variable);
    expect(Object.keys(recordMapOfType).length).to.be.equal(Object.keys(projectJson.records.variable).length);
    for (const rm in recordMapOfType) {
      expect(recordMapOfType[rm].type).to.be.equal(RT.variable);
    }
  });

  it ("should get record map for a project", () => {
    const projectF = r.record(projectJson);
    let allRecordMaps = {};
    const recordTypes = projectF.getRecordTypes();
    for (const type of recordTypes) {
      const recordMap = projectF.getRecordMapOfType(type);
      allRecordMaps = { ...allRecordMaps, ...recordMap };
    }
    const recordMap = projectF.getRecordMap();
    expect(Object.keys(recordMap).length).to.be.equal(Object.keys(allRecordMaps).length);
  });

  it ("should get deep record map for a project", () => {
    const projectF = r.record(projectJson);
    const deepRecordMap = projectF.getDeepRecordMap();
    console.log("=============> deep record map: ", deepRecordMap);
  });
});