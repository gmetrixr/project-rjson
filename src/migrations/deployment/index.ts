import { createRecord, RecordFactory, RecordNode, RT, rtp } from "../../r/R";
import { getHighestDeploymentVersion, deploymentMigrationTree } from "./deploymentMigrations";
import initialRMigration from "./deployment-migration-commands/d199_200_initial_migration_from_rjson_to_rjson2";

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
  //Check if deployment hasn't been converted to recordNode yet
  // 2 is the latest migration version in rjson, so the condition is < 3
  if(deploymentJson?.props?.deployment_version === undefined || deploymentJson?.props?.deployment_version < 3) {
    //The following step converts the json to "r" type and makes the version number 1
    deploymentJson = initialRMigration.execute(deploymentJson);
  }

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