import { expect } from "chai";
import { createNewDeployment, migrateDeployment } from "../../src/migrations/deployment/index";
import { RT } from "../../src/r/R";
import deploymentJson from "./jsons/deployment.json";

describe ("r Migration tests", () => {
  it ("should create new deployment", () => {
    const deployment = createNewDeployment();
    expect(deployment.type).to.be.equal(RT.deployment);
  });

  it ("should migrate deployment from rjson to rjson2", () => {
    const migratedDeployment = migrateDeployment(deploymentJson);
    console.log("=============> migrated deployment: ", migratedDeployment);
  });
});