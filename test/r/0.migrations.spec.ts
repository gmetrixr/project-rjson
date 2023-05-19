import { expect } from "chai";
import { createNewDeployment, migrateDeployment } from "../../src/migrations/deployment/index";
import { migrateProject } from "./../../src/migrations/project";
import { RT } from "../../src/r/R";
import deploymentJson from "./jsons/deployment.json";
import oldProjectJson from "./jsons/oldProject.json";

describe ("r Migration tests", () => {
  it ("should create new deployment", () => {
    const deployment = createNewDeployment();
    expect(deployment.type).to.be.equal(RT.deployment);
  });

  it ("should migrate deployment from rjson to rjson2 structure", () => {
    const migratedDeployment = migrateDeployment(deploymentJson);
  });

  it ("should migrate project from rjson to rjson2 structure", () => {
    const migratedProject = migrateProject(oldProjectJson);
    console.dir(migratedProject, { depth: null });
  });
});