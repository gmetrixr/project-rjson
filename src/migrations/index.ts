import { createNewDeployment, migrateDeployment, getHighestDeploymentVersion } from "./deployment";
import { createNewDiscussion, migrateDiscussion, getHighestDiscussionVersion } from "./discussion";
import { migrateGlobalVarsDefitions } from "./globalVariables";
import { createNewProject, 
  getHighestProjectVersion, migrateProject, 
  projecHealthCheckMigrations, 
  projectViewerRuntimeMigrations, projectPreviewerRuntimeMigrations } from "./project";

const migrations = {
  //deployment
  createNewDeployment, migrateDeployment, getHighestDeploymentVersion,
  //discussion
  createNewDiscussion, migrateDiscussion, getHighestDiscussionVersion,
  //project
  createNewProject, migrateProject, getHighestProjectVersion,
  projecHealthCheckMigrations, projectViewerRuntimeMigrations, projectPreviewerRuntimeMigrations,
  //glbal vars
  migrateGlobalVarsDefitions,
}

export { migrations };
