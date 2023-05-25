import { expect } from "chai";
import { createNewDeployment, migrateDeployment } from "../../src/migrations/deployment/index";
import { migrateProject } from "./../../src/migrations/project";
import { migrateDiscussion } from "./../../src/migrations/discussion";
import { RT } from "../../src/r/R";
import fs from "fs";
import deploymentJson from "./jsons/deployment.json";
import oldProjectJson from "./jsons/oldProject.json";
import newtonStoreJson from "./jsons/newtonStore.json";
import manishMalhotraJson from "./jsons/manishMalhotra.json";
import deleteRecordsLinkedToIdJson from "./jsons/deleteRecordsLinkedToId.json";
import threeScenesJson from "./jsons/threeScenes.json";
import discussionJson from "./jsons/discussion.json";
import myMetaverseJson from "./jsons/myMetaverse.json";

describe ("r Migration tests", () => {
  it ("should create new deployment", () => {
    const deployment = createNewDeployment();
    expect(deployment.type).to.be.equal(RT.deployment);
  });

  // it ("migrate elements", function () {
  //   this.timeout(15000);
  //   fs.writeFileSync("./test/r/jsons/r3fJsons/deployment/deployment.json", JSON.stringify(migrateDeployment(deploymentJson)));
  //   fs.writeFileSync("./test/r/jsons/r3fJsons/project/newton.json", JSON.stringify(migrateProject(newtonStoreJson)));
  //   fs.writeFileSync("./test/r/jsons/r3fJsons/project/manish.json", JSON.stringify(migrateProject(manishMalhotraJson)));
  //   fs.writeFileSync("./test/r/jsons/r3fJsons/project/old.json", JSON.stringify(migrateProject(oldProjectJson)));
  //   fs.writeFileSync("./test/r/jsons/r3fJsons/project/deleteRecordsLinkedToId.json", JSON.stringify(migrateProject(deleteRecordsLinkedToIdJson)));
  //   fs.writeFileSync("./test/r/jsons/r3fJsons/project/threeScenesJson.json", JSON.stringify(migrateProject(threeScenesJson)));
  //   fs.writeFileSync("./test/r/jsons/r3fJsons/project/myMetaverse.json", JSON.stringify(migrateDiscussion(myMetaverseJson)));
  //   fs.writeFileSync("./test/r/jsons/r3fJsons/discussion/discussion.json", JSON.stringify(migrateDiscussion(discussionJson)));
  //   expect(true).to.be.true;
  // });
});