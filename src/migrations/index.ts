import { createNewDeployment, migrateDeployment, getHighestDeploymentVersion } from "./deployment";
import { migrateDiscussion } from "./discussion";
import { createNewProject, migrateProject, getHighestProjectVersion, runHealthCheckMigrations } from "./project";

const migrations = {
  createNewDeployment, migrateDeployment, getHighestDeploymentVersion,
  migrateDiscussion,
  createNewProject, migrateProject, getHighestProjectVersion, runHealthCheckMigrations
}

export { migrations };
