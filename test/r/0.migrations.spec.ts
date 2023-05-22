import { expect } from "chai";
import { createNewDeployment, migrateDeployment } from "../../src/migrations/deployment/index";
import { migrateProject } from "./../../src/migrations/project";
import { RT } from "../../src/r/R";
import fs from "fs";
import deploymentJson from "./jsons/deployment.json";
import oldProjectJson from "./jsons/oldProject.json";
import newtonStoreJson from "./jsons/newtonStore.json";
import manishMalhotraJson from "./jsons/manishMalhotra.json";

describe ("r Migration tests", () => {
  it ("should create new deployment", () => {
    const deployment = createNewDeployment();
    expect(deployment.type).to.be.equal(RT.deployment);
  });

  it ("migrate elements", () => {
    fs.writeFileSync("./test/r/jsons/r3fJsons/deployment/deployment.json", JSON.stringify(migrateDeployment(deploymentJson)));
    fs.writeFileSync("./test/r/jsons/r3fJsons/project/newton.json", JSON.stringify(migrateProject(newtonStoreJson)));
    fs.writeFileSync("./test/r/jsons/r3fJsons/project/manish.json", JSON.stringify(migrateProject(manishMalhotraJson)));
    fs.writeFileSync("./test/r/jsons/r3fJsons/project/old.json", JSON.stringify(migrateProject(oldProjectJson)));
    expect(true).to.be.true;
  });
});