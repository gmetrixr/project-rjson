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

  it ("should change record name of type for a project", () => {
    const projectF = r.record(projectJson);
    projectF.changeDeepRecordName(1684391763659);
    projectF.changeDeepRecordName(1684391315311, "Variable Name Update");
    const recordMapOfTypeVar = projectF.getRecordMap(RT.variable);
    expect(recordMapOfTypeVar["1684391763659"].name).to.be.equal(recordTypeDefinitions[RT.variable].defaultName);
    expect(recordMapOfTypeVar["1684391315311"].name).to.be.equal("Variable Name Update");
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
    const recordMapOfType = r.record(projectJson).getRecordMap(RT.variable);
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
      const recordMap = projectF.getRecordMap(type);
      allRecordMaps = { ...allRecordMaps, ...recordMap };
    }
    const recordMap = projectF.getRecordMap();
    expect(Object.keys(recordMap).length).to.be.equal(Object.keys(allRecordMaps).length);
  });

  it ("should get deep record map for a project", () => {
    expect(Object.keys(r.record(projectJson).getDeepRecordMap()).length).to.be.equal(10);
  });

  it ("should get record of type for a project", () => {
    const record = r.record(projectJson).getRecord(1684325255018, RT.scene);
    expect(record).to.not.be.undefined;
    expect(record?.type).to.be.equal("scene");
  });

  it ("should get record for a project", () => {
    const record = r.record(projectJson).getRecord(1684391315311);
    expect(record).to.not.be.undefined;
    expect(record?.type).to.be.equal(RT.variable);
  });

  it ("should get a deep record for a project", () => {
    const record = r.record(projectJson).getDeepRecord(1684392104132);
    expect(record).to.not.be.undefined;
    expect(record?.type).to.be.equal(RT.element);
  });

  it ("should get sorted record entries of type for a project", () => {
    const sortedRecordEntries = r.record(projectJson).getSortedRecordEntries(RT.variable);
    for (let i = 0; i < sortedRecordEntries.length - 1; i++) {
      expect(sortedRecordEntries[i][1].order).to.be.lessThan(sortedRecordEntries[i+1][1].order as number);
    }
  });

  it ("should get sorted ids of type for a project", () => {
    const projectF = r.record(projectJson);
    const sortedIds = projectF.getSortedRecordIds(RT.scene);
    for (let i = 0; i < sortedIds.length - 1; i++) {
      expect(projectF.getRecord(sortedIds[i])?.order).to.be.lessThan(projectF.getRecord(sortedIds[i+1])?.order as number);
    }
  });

  it ("should get sorted records of type for a project", () => {
    const sortedRecords = r.record(projectJson).getSortedRecords(RT.variable);
    for (let i = 0; i < sortedRecords.length - 1; i++) {
      expect(sortedRecords[i].order).to.be.lessThan(sortedRecords[i+1].order as number);
    }
  });

  it ("should get address of a subnode for a project", () => {
    const projectF = r.record(projectJson);
    const address = projectF.getAddress({ id: 1684405505170 });
    const addressWithType = projectF.getAddress({ id: 1684405505170, type: RT.scene });
    const addressWithSelfAddress = projectF.getAddress({ id: 1684405505170, selfAddr: "project" });
    const addressWithProperty = projectF.getAddress({ id: 1684405505170, property: rtp.scene.scene_allow_zooming });
    const addressWithPropertyAndIndex = projectF.getAddress({ id: 1684405505170, property: rtp.scene.scene_allow_zooming, index: 2 });
    const addressWithEverything = projectF.getAddress({ id: 1684405505170, type: RT.scene, selfAddr: "project", property: rtp.scene.scene_allow_zooming, index: 2 });
    expect(address).to.be.equal("scene:1684405505170");
    expect(addressWithType).to.be.equal("scene:1684405505170");
    expect(addressWithSelfAddress).to.be.equal("project|scene:1684405505170");
    expect(addressWithProperty).to.be.equal("scene:1684405505170!scene_allow_zooming");
    expect(addressWithPropertyAndIndex).to.be.equal("scene:1684405505170!scene_allow_zooming>2");
    expect(addressWithEverything).to.be.equal("project|scene:1684405505170!scene_allow_zooming>2");
  });

  it ("should get record and parent with id for a project", () => {
    const rpid1 = r.record(projectJson).getRecordAndParent(1684391763659);
    expect(rpid1?.p?.type).to.be.equal(RT.project);
    expect(rpid1?.r.type).to.be.equal(RT.variable);
    expect(rpid1?.id).to.be.equal(1684391763659);

    const rpid2 = r.record(projectJson).getRecordAndParent(1684404927844);
    expect(rpid2?.p?.type).to.be.equal(RT.scene);
    expect(rpid2?.r.type).to.be.equal(RT.element);
    expect(rpid2?.id).to.be.equal(1684404927844);
  });

  it ("should get record and parent at address for a project", () => {
    const rpid = r.record(projectJson).getRecordAndParent("scene:1684325255018|element:1684404941443");
    expect(rpid?.p?.type).to.be.equal(RT.scene);
    expect(rpid?.r.type).to.be.equal(RT.element);
    expect(rpid?.r.props.element_type).to.be.equal("pano_image");
    expect(rpid?.id).to.be.equal(1684404941443);
  });

  it ("should get property at address for a project", () => {
    const projectF = r.record(projectJson);
    expect(projectF.getPropertyAtAddress("scene:1684325255018|element:1684404941443!hidden")).to.be.equal(false);
    expect(projectF.getPropertyAtAddress("variable:1684391763659!var_type")).to.be.equal("string");
  });

  it ("should update property at address for a project", () => {
    const projectF = r.record(projectJson);
    projectF.updatePropertyAtAddress("scene:1684325255018|element:1684392104132!wireframe", true);
    projectF.updatePropertyAtAddress("variable:1684391315311!var_default", 8);
    expect(projectF.getPropertyAtAddress("scene:1684325255018|element:1684392104132!wireframe")).to.be.equal(true);
    expect(projectF.getPropertyAtAddress("variable:1684391315311!var_default")).to.be.equal(8);
  });

  it ("should change deep record id for a project", () => {
    const projectF = r.record(projectJson);
    projectF.changeDeepRecordId(1684404927844);
    const recordMap = projectF.getDeepRecordMap();
  });
});