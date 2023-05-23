import { expect } from "chai";
import { RT, RecordFactory, RecordNode, createRecord, recordTypeDefinitions, rtp } from "../../src/r/R";
import { projectPropertyDefaults } from "../../src/r/recordTypes/Project";
import projectJson from "./jsons/project.json";
import migratedOldProjectJson from "./jsons/migratedOldProject.json";
import deleteRecordsLinkedToIdJson from "./jsons/r3fJsons/project/deleteRecordsLinkedToId.json";

const clipboardData = {
  nodes: [
    {
      id: 8959215053928812,
      record: {
        type: "scene",
        name: "Zaphod",
        order: 1,
        props: {},
        records: {
          element: {
            "8755535121841602": {
              type: "element",
              name: "Cube",
              order: 2,
              props: { element_type: "cube", wireframe: true }
            },
            "1817839176130281": {
              type: "element",
              name: "Pano Image",
              order: 1,
              props: { element_type: "pano_image" }
            },
            "5107063617281648": {
              type: "element",
              name: "Polygon",
              order: 3,
              props: { element_type: "polygon" }
            }
          },
          rule: {
            "1806034342096145": {
              name: "Rule the world",
              type: "rule",
              props: { tracked: false },
              records: {
                when_event: {
                  "9952587783980130": {
                    type: "when_event",
                    props: {
                      co_id: "1684392104132",
                      event: "on_click",
                      co_type: "cube",
                      properties: []
                    }
                  }
                },
                then_action: {
                  "5855176384035994": {
                    type: "then_action",
                    props: {
                      co_id: "1684404927844",
                      co_type: "polygon",
                      action: "toggle_showhide",
                      properties: []
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  ]
};

describe ("r RecordFactory tests", () => {
  it ("should create a new project", () => {
    const project = createRecord(RT.project);
    expect(project.type).to.be.equal("project");
  });

  it ("should get project name" , () => {
    expect(new RecordFactory(projectJson).getName()).to.be.equal(projectJson.name);
  });

  it ("should change record name of type for a project", () => {
    const projectF = new RecordFactory(projectJson);
    projectF.changeDeepRecordName(1684391763659);
    projectF.changeDeepRecordName(1684391315311, "Variable Name Update");
    const recordMapOfTypeVar = projectF.getRecordMap(RT.variable);
    expect(recordMapOfTypeVar["1684391763659"].name).to.be.equal(recordTypeDefinitions[RT.variable].defaultName);
    expect(recordMapOfTypeVar["1684391315311"].name).to.be.equal("Variable Name Update");
  });

  it ("should get project props", () => {
    const props = new RecordFactory(projectJson).getProps();
    expect(props.length).to.be.equal(Object.keys(projectJson.props).length);
    expect(props[0]).to.be.equal(Object.keys(projectJson.props)[0]);
  });

  it ("should get all possible project props", () => {
    expect(new RecordFactory(projectJson).getAllPossibleProps().length).to.be.equal(Object.keys(projectPropertyDefaults).length);
  });

  it ("should get project property value", () => {
    expect(new RecordFactory(projectJson).get(rtp.project.show_menu)).to.be.equal(projectJson.props.show_menu);
  });

  it ("should set project property value", () => {
    const projectF = new RecordFactory(projectJson);
    projectF.set(rtp.project.auto_add_new_scene_to_menu, true);
    const autoAddNewSceneToMenu = projectF.get(rtp.project.auto_add_new_scene_to_menu);
    expect(autoAddNewSceneToMenu).to.be.equal(true);
  });

  it ("should reset project property value", () => {
    const projectF = new RecordFactory(projectJson);
    projectF.reset(rtp.project.show_menu);
    const showMenu = projectF.get(rtp.project.show_menu);
    expect(showMenu).to.be.equal(projectPropertyDefaults.show_menu);
  });

  it ("should delete project property", () => {
    const projectF = new RecordFactory(projectJson);
    projectF.delete(rtp.project.show_menu);
    const showMenu = projectF.get(rtp.project.show_menu);
    expect(showMenu).to.be.undefined;
  });

  it ("should get defined or default value for a project property", () => {
    expect(new RecordFactory(projectJson).getValueOrDefault(rtp.project.auto_add_new_scene_to_tour_mode)).to.be.equal(projectPropertyDefaults.auto_add_new_scene_to_tour_mode);
  });

  it ("should get a clone default value for a project property", () => {
    expect(new RecordFactory(projectJson).getDefault(rtp.project.auto_add_new_scene_to_menu)).to.be.equal(projectPropertyDefaults.auto_add_new_scene_to_menu);
  });

  it ("should get record types for a project", () => {
    const recordTypes = new RecordFactory(projectJson).getRecordTypes();
    expect(recordTypes.length).to.be.equal(Object.keys(projectJson.records).length);
    for (const type of recordTypes) {
      expect(recordTypeDefinitions).have.property(type);
    }
  });

  it ("should get record map of types for a project", () => {
    const recordMapOfType = new RecordFactory(projectJson).getRecordMap(RT.variable);
    expect(Object.keys(recordMapOfType).length).to.be.equal(Object.keys(projectJson.records.variable).length);
    for (const rm in recordMapOfType) {
      expect(recordMapOfType[rm].type).to.be.equal(RT.variable);
    }
  });

  it ("should get record map for a project", () => {
    const projectF = new RecordFactory(projectJson);
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
    expect(Object.keys(new RecordFactory(projectJson).getDeepRecordMap()).length).to.be.equal(10);
  });

  it ("should get record of type for a project", () => {
    const record = new RecordFactory(projectJson).getRecord(1684325255018, RT.scene);
    expect(record).to.not.be.undefined;
    expect(record?.type).to.be.equal("scene");
  });

  it ("should get record for a project", () => {
    const record = new RecordFactory(projectJson).getRecord(1684391315311);
    expect(record).to.not.be.undefined;
    expect(record?.type).to.be.equal(RT.variable);
  });

  it ("should get a deep record for a project", () => {
    const record = new RecordFactory(projectJson).getDeepRecord(1684392104132);
    expect(record).to.not.be.undefined;
    expect(record?.type).to.be.equal(RT.element);
  });

  it ("should get record entries for a project for one level", () => {
    const projectF = new RecordFactory(projectJson);
    const recordEntries = projectF.getRecordEntries();
    const recordMap = projectF.getRecordMap();
    expect(Object.keys(recordMap).length).to.be.equal(recordEntries.length);
  });

  it ("should get record entries of type for a project for one level", () => {
    const projectF = new RecordFactory(projectJson);
    const recordEntries = projectF.getRecordEntries(RT.scene);
    const recordMap = projectF.getRecordMap(RT.scene);
    expect(Object.keys(recordMap).length).to.be.equal(recordEntries.length);
  });

  it ("should get record ids for a project for one level", () => {
    const projectF = new RecordFactory(projectJson);
    const recordMap = projectF.getRecordMap();
    const recordIds = projectF.getRecordIds();
    const recordMapIds = Object.keys(recordMap);
    expect(recordMapIds.length).to.be.equal(recordIds.length);
    for (const id of recordIds) {
      expect(recordMapIds).to.include(String(id));
    }
  });

  it ("should get record ids of type for a project for one level", () => {
    const projectF = new RecordFactory(projectJson);
    const recordMap = projectF.getRecordMap(RT.variable);
    const recordIds = projectF.getRecordIds(RT.variable);
    const recordMapIds = Object.keys(recordMap);
    expect(recordMapIds.length).to.be.equal(recordIds.length);
    for (const id of recordIds) {
      expect(recordMapIds).to.include(String(id));
    }
  });

  it ("should get records for a project for one level", () => {
    const projectF = new RecordFactory(projectJson);
    const recordMap = projectF.getRecordMap();
    const records = projectF.getRecords();
    expect(Object.keys(recordMap).length).to.be.equal(records.length);
  });

  it ("should get records for a project for one level", () => {
    const projectF = new RecordFactory(projectJson);
    const recordMap = projectF.getRecordMap(RT.variable);
    const records = projectF.getRecords(RT.variable);
    expect(Object.keys(recordMap).length).to.be.equal(records.length);
  });

  it ("should get sorted record entries of type for a project", () => {
    const sortedRecordEntries = new RecordFactory(projectJson).getSortedRecordEntries(RT.variable);
    for (let i = 0; i < sortedRecordEntries.length - 1; i++) {
      expect(sortedRecordEntries[i][1].order).to.be.lessThan(sortedRecordEntries[i+1][1].order as number);
    }
  });

  it ("should get sorted ids of type for a project", () => {
    const projectF = new RecordFactory(projectJson);
    const sortedIds = projectF.getSortedRecordIds(RT.scene);
    for (let i = 0; i < sortedIds.length - 1; i++) {
      expect(projectF.getRecord(sortedIds[i])?.order).to.be.lessThan(projectF.getRecord(sortedIds[i+1])?.order as number);
    }
  });

  it ("should get sorted records of type for a project", () => {
    const sortedRecords = new RecordFactory(projectJson).getSortedRecords(RT.variable);
    for (let i = 0; i < sortedRecords.length - 1; i++) {
      expect(sortedRecords[i].order).to.be.lessThan(sortedRecords[i+1].order as number);
    }
  });

  it ("should get address of a subnode for a project", () => {
    const projectF = new RecordFactory(projectJson);
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
    const rpid1 = new RecordFactory(projectJson).getRecordAndParent(1684391763659);
    expect(rpid1?.p?.type).to.be.equal(RT.project);
    expect(rpid1?.r.type).to.be.equal(RT.variable);
    expect(rpid1?.id).to.be.equal(1684391763659);

    const rpid2 = new RecordFactory(projectJson).getRecordAndParent(1684404927844);
    expect(rpid2?.p?.type).to.be.equal(RT.scene);
    expect(rpid2?.r.type).to.be.equal(RT.element);
    expect(rpid2?.id).to.be.equal(1684404927844);
  });

  it ("should get record and parent at address for a project", () => {
    const rpid = new RecordFactory(projectJson).getRecordAndParent("scene:1684325255018|element:1684404941443");
    expect(rpid?.p?.type).to.be.equal(RT.scene);
    expect(rpid?.r.type).to.be.equal(RT.element);
    expect(rpid?.r.props.element_type).to.be.equal("pano_image");
    expect(rpid?.id).to.be.equal(1684404941443);
  });

  it ("should get property at address for a project", () => {
    const projectF = new RecordFactory(projectJson);
    expect(projectF.getPropertyAtAddress("scene:1684325255018|element:1684404941443!hidden")).to.be.equal(false);
    expect(projectF.getPropertyAtAddress("variable:1684391763659!var_type")).to.be.equal("string");
  });

  it ("should update property at address for a project", () => {
    const projectF = new RecordFactory(projectJson);
    projectF.updatePropertyAtAddress("scene:1684325255018|element:1684392104132!wireframe", true);
    projectF.updatePropertyAtAddress("variable:1684391315311!var_default", 8);
    expect(projectF.getPropertyAtAddress("scene:1684325255018|element:1684392104132!wireframe")).to.be.equal(true);
    expect(projectF.getPropertyAtAddress("variable:1684391315311!var_default")).to.be.equal(8);
  });

  it ("should get breadcrumbs at id for a project", () => {
    const breadcrumbs = new RecordFactory(migratedOldProjectJson).getBreadCrumbs(1672209618275);
    expect(breadcrumbs?.length).to.be.equal(3);
  });

  it ("should get breadcrumbs at address for a project", () => {
    const breadcrumbs = new RecordFactory(migratedOldProjectJson).getBreadCrumbs("scene:1670509178879|element:1672210857929|element:1672209618275");
    expect(breadcrumbs?.length).to.be.equal(3);
  });

  it ("should change deep record id for a project", () => {
    const projectF = new RecordFactory(projectJson);
    const newId = 565656565656565;
    const updatedRecordId = projectF.changeDeepRecordId(1684404927844, newId);
    const record = projectF.getDeepRecord(1684404927844);
    const updatedRecord = projectF.getDeepRecord(newId);
    expect(record).to.be.undefined;
    expect(updatedRecord).to.not.be.undefined;
  });

  it ("should cycle all record ids for a project", () => {
    const projectF = new RecordFactory(projectJson);
    const recordIds = projectF.getRecordIds();
    projectF.cycleAllSubRecordIds();
    for (const id of recordIds) {
      const recordAtId = projectF.getDeepRecord(id);
      expect(recordAtId).to.be.undefined;
    }
  });

  it ("should add scene for a project", () => {
    const projectF = new RecordFactory(migratedOldProjectJson);
    const scene1 = createRecord(RT.scene);
    const idAndRecord = projectF.addRecord({ record: scene1, position: 0 });
    expect(idAndRecord?.record.type).to.be.equal(RT.scene);
    const scene2 = createRecord(RT.scene);
    const idAndRecord2 = projectF.addRecord({ record: scene2, position: 1 });
    expect(idAndRecord2?.record.type).to.be.equal(RT.scene);
    const sortedSceneIds = projectF.getSortedRecordIds(RT.scene);
    expect(sortedSceneIds[0]).to.be.equal(idAndRecord?.id);
    expect(sortedSceneIds[1]).to.be.equal(idAndRecord2?.id);
  });

  it ("should add element at parent with id for a project", () => {
    const projectF = new RecordFactory(migratedOldProjectJson);
    const element = createRecord(RT.element);
    const idAndRecord = projectF.addRecord({ record: element, parentIdOrAddress: 1670508893305, dontCycleSubRecordIds: true });
    expect(idAndRecord).to.not.be.undefined;
    const recordAndParent = projectF.getRecordAndParent(idAndRecord?.id as number);
    expect(idAndRecord?.id as number).to.be.equal(recordAndParent?.id as number);
    expect(recordAndParent?.r.type).to.be.equal(RT.element);
  });

  it ("should add blank record for a project", () => {
    const projectF = new RecordFactory(migratedOldProjectJson);
    const idAndRecord = projectF.addBlankRecord({type: RT.variable});
    const idAndRecord2 = projectF.addBlankRecord({type: RT.variable, position: 5});
    const sortedRecordIds = projectF.getSortedRecordIds(RT.variable);
    expect(sortedRecordIds).to.include(idAndRecord?.id);
    expect(sortedRecordIds).to.include(idAndRecord?.id);
    expect(sortedRecordIds[sortedRecordIds.length - 1]).to.be.equal(idAndRecord?.id);
    expect(sortedRecordIds[5]).to.be.equal(idAndRecord2?.id);
  });

  it ("should delete records linked to id for a project", () => {
    const projectF = new RecordFactory(deleteRecordsLinkedToIdJson);
    projectF.deleteRecordsLinkedToId(1684747381632);
    const recordMap = projectF.getDeepRecordMap();
    let found = false;
    for (const key in recordMap) {
      if (recordMap[key].type === RT.when_event) {
        found = true;
      }
    }
    expect(found).to.be.equal(false);
  });

  it ("should delete record for a project", () => {
    const projectF = new RecordFactory(projectJson);
    const scenes = projectF.getRecordMap(RT.scene);
    const sceneId = Number(Object.keys(scenes)[1])
    projectF.deleteRecord(sceneId);
    const scene = projectF.getRecord(sceneId);
    expect(scene).to.be.undefined;
  });

  it ("should delete deep record for a project", () => {
    const projectF = new RecordFactory(migratedOldProjectJson);
    projectF.deleteDeepRecord(1672315364450);
    projectF.deleteDeepRecord("scene:1670509178879|element:1672316014426|element:1672315601428");
    const record1 = projectF.getDeepRecord(1672315364450);
    const record2 = projectF.getDeepRecord(1672315601428);
    expect(record1).to.be.undefined;
    expect(record2).to.be.undefined;
  });

  it ("should duplicate record for a project", () => {
    const projectF = new RecordFactory(migratedOldProjectJson);
    const duplicatedRecord = projectF.duplicateRecord(RT.scene, 1670509178879);
    const ogRecord = projectF.getRecord(1670509178879);
    expect(duplicatedRecord?.record.type).to.be.equal(ogRecord?.type);
    expect(duplicatedRecord?.record.name).to.include(ogRecord?.name);
  });

  it ("should duplicate deep record for a project", () => {
    const projectF = new RecordFactory(migratedOldProjectJson);
    const duplicatedDeepRecord = projectF.duplicateDeepRecord(1672314325487);
    const rAndP = projectF.getRecordAndParent(1672314325487);
    expect(rAndP?.p.name).to.be.equal(duplicatedDeepRecord?.p.name);
    expect(rAndP?.r.type).to.be.equal(duplicatedDeepRecord?.r.type);
  });

  it ("should change record name for a project", () => {
    const projectF = new RecordFactory(migratedOldProjectJson);
    projectF.changeRecordName(1681706075301, "updated name");
    expect(projectF.getRecord(1681706075301)?.name).to.be.equal("updated name");
  });

  it ("should change deep record name for a project", () => {
    const projectF = new RecordFactory(migratedOldProjectJson);
    projectF.changeDeepRecordName(1672313975089, "room updated name");
    expect(projectF.getDeepRecord(1672313975089)?.name).to.be.equal("room updated name");
  });

  it ("should reorder records for a project", () => {
    const projectF = new RecordFactory(migratedOldProjectJson);
    projectF.reorderRecords(RT.variable, [1681706075301, 1681707853893, -12], 4);
    const sortedRecordIds = projectF.getSortedRecordIds(RT.variable);
    expect(sortedRecordIds[3]).to.be.equal(1681706075301);
    expect(sortedRecordIds[4]).to.be.equal(1681707853893);
    expect(sortedRecordIds[5]).to.be.equal(-12);
  });

  it ("should copy deep records for a project", () => {
    const projectF = new RecordFactory(migratedOldProjectJson);
    projectF.copyDeepRecords([1672210242461, 1672209618275], 1672316014426);
    const record = projectF.getDeepRecord(1672316014426) as RecordNode<RT>;
    const rF = new RecordFactory(record);
    const recordMap = rF.getRecordMap();
    const record1 = projectF.getDeepRecord(1672210242461);
    const record2 = projectF.getDeepRecord(1672209618275);
    let found1 = false;
    let found2 = false;
    for (const key in recordMap) {
      if (recordMap[key].name === record1?.name) {
        found1 = true;
      }

      if (recordMap[key].name === record2?.name) {
        found2 = true;
      }
    }
    expect(found1).to.be.equal(true);
    expect(found2).to.be.equal(true);
  });

  it ("should move deep records for a project", () => {
    const projectF = new RecordFactory(migratedOldProjectJson);
    projectF.moveDeepRecords([1671081211191], 1670508893305);
    const rAndP = projectF.getRecordAndParent(1671081211191);
    const record = projectF.getDeepRecord(1670508893305);
    expect(rAndP?.p.name).to.be.equal(record?.name);
    expect(rAndP?.p.type).to.be.equal(record?.type);
  });

  it ("should copy to clipboard for a project", () => {
    const projectF = new RecordFactory(projectJson);
    const recordIds = projectF.getRecordIds(RT.scene);
    const clipboard = projectF.copyToClipboard([ recordIds[0] ]);
    const sceneCopied = clipboard.nodes.find(r => r.id === recordIds[0]);
    expect(sceneCopied).not.to.equal(null);
  });

  it ("should paste from clipboard for a project", () => {
    const projectF = new RecordFactory(projectJson);
    const scenesBeforePasting = projectF.getRecordIds(RT.scene);
    projectF.pasteFromClipboard("", clipboardData);
    const scenesAfterPasting = projectF.getRecordIds(RT.scene);
    expect(scenesBeforePasting.length + 1).to.be.equal(scenesAfterPasting.length);
  });
});