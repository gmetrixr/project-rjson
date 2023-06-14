import { createNewDeployment, migrateDeployment, getHighestDeploymentVersion } from "./deployment";
import { migrateDiscussion } from "./discussion";
import { createNewProject, migrationsForNewProject, migrateProject, getHighestProjectVersion } from "./project";

const migrations = {
  createNewDeployment, migrateDeployment, getHighestDeploymentVersion,
  migrateDiscussion,
  createNewProject, migrationsForNewProject, migrateProject, getHighestProjectVersion,
}

export { migrations };
