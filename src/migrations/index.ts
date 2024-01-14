import { createNewDeployment, migrateDeployment, getHighestDeploymentVersion } from "./deployment/index.js";
import { createNewDiscussion, migrateDiscussion, getHighestDiscussionVersion } from "./discussion/index.js";
import { migrateGlobalVarsDefitions } from "./globalVariables/index.js";
import { createNewProject, 
  getHighestProjectVersion, migrateProject, 
  projecHealthCheckMigrations, 
  projectViewerRuntimeMigrations, projectPreviewerRuntimeMigrations } from "./project/index.js";

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
