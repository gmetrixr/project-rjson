import { expect } from "chai";
import { RT, RecordFactory, RecordNode } from "../../src/r/R/index.js";
import { SceneFactory } from "../../src/r/recordFactories/SceneFactory.js";
import manishMalhotraJson from "./jsons/r3fJsons/project/manish.json";

describe("r SceneFactory tests", () => {
  it ("should delete record from a scene", () => {
    const scene = new RecordFactory(manishMalhotraJson).getRecord(1649994283381, RT.scene) as RecordNode<RT.scene>;
    const sceneF = new SceneFactory(scene);
    sceneF.deleteRecord(6607795019176957);
    const record = sceneF.getRecord(6607795019176957);
    expect(record).to.be.undefined;
  });

  it ("should delete deep record from a scene", () => {
    const scene = new RecordFactory(manishMalhotraJson).getRecord(1649994283381, RT.scene) as RecordNode<RT.scene>;
    const sceneF = new SceneFactory(scene);
    sceneF.deleteDeepRecord(7759957970554660);
    const record = sceneF.getDeepRecord(7759957970554660);
    expect(record).to.be.undefined;
  });

  it ("should delete rules for given cog id for a scene", () => {
    const scene = new RecordFactory(manishMalhotraJson).getRecord(1649994283381, RT.scene) as RecordNode<RT.scene>;
    const sceneF = new SceneFactory(scene);
    sceneF.deleteRulesForCoId(1610600394641);
    const whenEventWithCogId = sceneF.getDeepRecord(1611818713661);
    expect(whenEventWithCogId).to.be.undefined;
  });
});