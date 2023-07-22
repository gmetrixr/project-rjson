import { createNewDeployment, migrateDeployment, getHighestDeploymentVersion } from "./deployment";
import { createNewDiscussion, migrateDiscussion, getHighestDiscussionVersion } from "./discussion";
import { migrateGlobalVarsDefitions } from "./globalVariables";
import { createNewProject, migrateProject, getHighestProjectVersion, runHealthCheckMigrations } from "./project";

const migrations = {
  createNewDeployment, migrateDeployment, getHighestDeploymentVersion,
  createNewDiscussion, migrateDiscussion, getHighestDiscussionVersion,
  migrateGlobalVarsDefitions,
  createNewProject, migrateProject, getHighestProjectVersion, runHealthCheckMigrations
}

export { migrations };