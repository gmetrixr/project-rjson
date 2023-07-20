import { createNewDeployment, migrateDeployment, getHighestDeploymentVersion } from "./deployment";
import { migrateDiscussion } from "./discussion";
import { migrateGlobalVarsDefitions } from "./globalVariables";
import { createNewProject, migrateProject, getHighestProjectVersion, runHealthCheckMigrations } from "./project";

const migrations = {
  createNewDeployment, migrateDeployment, getHighestDeploymentVersion,
  migrateDiscussion,
  migrateGlobalVarsDefitions,
  createNewProject, migrateProject, getHighestProjectVersion, runHealthCheckMigrations
}

export { migrations };
