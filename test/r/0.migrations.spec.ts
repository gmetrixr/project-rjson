import { createNewDeployment, migrateDeployment } from "../../src/migrations/deployment/index.js";
import { migrateProject, projectViewerRuntimeMigrations } from "./../../src/migrations/project/index.js";
import { migrateDiscussion } from "./../../src/migrations/discussion/index.js";
import { RT } from "../../src/r/R/index.js";
import fs from "fs";
import deploymentJson from "./jsons/deployment.json";
import campusJson from "./jsons/campus.json";
import oldProjectJson from "./jsons/oldProject.json";
import newtonStoreJson from "./jsons/newtonStore.json";
import manishMalhotraJson from "./jsons/manishMalhotra.json";
import deleteRecordsLinkedToIdJson from "./jsons/deleteRecordsLinkedToId.json";
import threeScenesJson from "./jsons/threeScenes.json";
import discussionJson from "./jsons/discussion.json";
import myMetaverseJson from "./jsons/myMetaverse.json";
import learningJson from "./jsons/learning.json";
import safeHandsJson from "./jsons/safeHands.json";
import dormantElementJson from "./jsons/r3fJsons/project/dormantElementTest.json";
import { ProjectFactory } from "../../src/r/recordFactories/index.js";
import console from "console";

//https://stackoverflow.com/a/68017229/1233476
const jestConsole = console;
beforeEach(() => { global.console = console; });
afterEach(() => { global.console = jestConsole; });

describe ("r Migration tests", () => {
  it ("should create new deployment", () => {
    const deployment = createNewDeployment();
    expect(deployment.type).toBe(RT.deployment);
  });

  xit ("migrate elements", function () {
    fs.writeFileSync("./test/r/jsons/r3fJsons/deployment/deployment.json", JSON.stringify(migrateDeployment(deploymentJson)));
    fs.writeFileSync("./test/r/jsons/r3fJsons/project/safeHands.json", JSON.stringify(migrateProject(safeHandsJson)));
    fs.writeFileSync("./test/r/jsons/r3fJsons/project/newton.json", JSON.stringify(migrateProject(newtonStoreJson)));
    fs.writeFileSync("./test/r/jsons/r3fJsons/project/manish.json", JSON.stringify(migrateProject(manishMalhotraJson)));
    fs.writeFileSync("./test/r/jsons/r3fJsons/project/old.json", JSON.stringify(migrateProject(oldProjectJson)));
    fs.writeFileSync("./test/r/jsons/r3fJsons/project/deleteRecordsLinkedToId.json", JSON.stringify(migrateProject(deleteRecordsLinkedToIdJson)));
    fs.writeFileSync("./test/r/jsons/r3fJsons/project/threeScenesJson.json", JSON.stringify(migrateProject(threeScenesJson)));
    fs.writeFileSync("./test/r/jsons/r3fJsons/project/myMetaverse.json", JSON.stringify(migrateDiscussion(myMetaverseJson)));
    fs.writeFileSync("./test/r/jsons/r3fJsons/discussion/discussion.json", JSON.stringify(migrateDiscussion(discussionJson)));
    expect(true).toBe(true);
  }, 30000);

  it("should migrate a large project json", function() {
    const st = performance.now();
    console.log("Started large migration at:", st);
    const migratedProject = migrateProject(learningJson);
    const et = performance.now();
    console.log("Ended large migration at:", et);
    //fs.writeFileSync("./test/r/jsons/r3fJsons/project/learning.json", JSON.stringify(migratedProject));
  }, 7000)

  it("Testing if rule ids cycle correctly", function() {
    const st = performance.now();
    console.log("Started large migration at:", st);
    const migratedProject = migrateProject(campusJson, 200);
    const et = performance.now();
    console.log("Ended large migration at:", et);
    //fs.writeFileSync("./test/r/jsons/r3fJsons/project/campus.json", JSON.stringify(migratedProject));
  }, 5000)

  it("Testing if capture element gets deleted", function() {
    const migratedProject = projectViewerRuntimeMigrations(dormantElementJson);
    const idAndRecord = new ProjectFactory(migratedProject).getDeepIdAndRecord(2353489588758041);
    expect(idAndRecord).toBeDefined;
    //fs.writeFileSync("./test/r/jsons/r3fJsons/project/dormantElementTestMigrated.json", JSON.stringify(migratedProject));
  });
});
