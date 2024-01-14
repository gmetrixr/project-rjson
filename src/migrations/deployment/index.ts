import { getHighestDeploymentVersion, deploymentMigrationTree } from "./deploymentMigrations.js";
import { createRecord, RecordFactory, RecordNode, RT, rtp } from "../../r/R/index.js";

const deploymentMigrationVersions: number[] = Object.keys(deploymentMigrationTree).map(numStr => parseInt(numStr)).sort((a, b) => (a - b));

export const createNewDeployment = (): RecordNode<RT.deployment> => {
  const deployment = createRecord(RT.deployment);
  const recordF = new RecordFactory(deployment);

  recordF.set(rtp.deployment.deployment_version, getHighestDeploymentVersion());
  return deployment;
}

/**
 * Applies migrations for "r" type and returns a new project reference
 */
export const migrateDeployment = (deploymentJson: any, uptoVersion?: number): RecordNode<RT.deployment> => {
  const rDeploymentJson = deploymentJson as RecordNode<RT.deployment>;
  let jsonVersion = rDeploymentJson?.props?.deployment_version as number ?? 0;
  if(uptoVersion === undefined) {
    uptoVersion = deploymentMigrationVersions[deploymentMigrationVersions.length - 1] + 1;
  }

  for(const key of deploymentMigrationVersions) {
    if(jsonVersion === key && key < uptoVersion) {
      console.log(`Running r migration ${key}`);
      deploymentMigrationTree[key].execute(deploymentJson);
      jsonVersion = deploymentJson.props.deployment_version as number;
    }
  }

  return deploymentJson;
}

export { getHighestDeploymentVersion };
