import { createNewProject, migrationsForNewProject, migrateProject, getHighestProjectVersion } from "./project";
import { createNewDeployment, migrateDeployment, getHighestDeploymentVersion } from "./deployment";

const migrations = {
  createNewProject, migrationsForNewProject, migrateProject, getHighestProjectVersion,
  createNewDeployment, migrateDeployment, getHighestDeploymentVersion,
}

export { migrations };
