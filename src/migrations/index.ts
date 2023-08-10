import { createNewDeployment, migrateDeployment, getHighestDeploymentVersion } from "./deployment";
import { createNewDiscussion, migrateDiscussion, getHighestDiscussionVersion } from "./discussion";
import { migrateGlobalVarsDefitions } from "./globalVariables";
import { createNewProject, 
  getHighestProjectVersion, runProjectMigrations, 
  runHealthCheckMigrations, 
  runViewerRuntimeMigrations } from "./project";

const migrations = {
  //deployment
  createNewDeployment, migrateDeployment, getHighestDeploymentVersion,
  //discussion
  createNewDiscussion, migrateDiscussion, getHighestDiscussionVersion,
  //project
  createNewProject, 
  getHighestProjectVersion, runProjectMigrations, 
  runHealthCheckMigrations,
  runViewerRuntimeMigrations,
  migrateGlobalVarsDefitions,
}

export { migrations };
