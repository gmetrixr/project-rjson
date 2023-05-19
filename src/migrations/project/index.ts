import { RecordNode, RT } from "../../r/R";
import { getHighestProjectVersion, projectMigrationTree } from "./projectMigrations";
import initialRMigration from "./project-migration-commands/m199_200_initial_migration_from_rjson_to_rjson2_structure";

const projectMigrationVersions: number[] = Object.keys(projectMigrationTree).map(numStr => parseInt(numStr)).sort((a, b) => (a - b));

/**
 * Applies migrations for "r" type and returns a new project reference
 */
export const migrateProject = (projectJson: any, uptoVersion?: number): RecordNode<RT.project> => {
  // Check if project hasn't been converted to recordNode yet
  if(projectJson?.props?.version === undefined || projectJson?.props?.version < 199) {
    //The following step converts the json to "r" type and makes the version number 1
    projectJson = initialRMigration.execute(projectJson);
  }

  const rProjectJson = projectJson as RecordNode<RT.project>;
  let jsonVersion = rProjectJson?.props?.version as number ?? 0;
  if(uptoVersion === undefined) {
    uptoVersion = projectMigrationVersions[projectMigrationVersions.length - 1] + 1;
  }

  for(const key of projectMigrationVersions) {
    if(jsonVersion === key && key < uptoVersion) {
      console.log(`Running r migration ${key}`);
      projectMigrationTree[key].execute(projectJson);
      jsonVersion = projectJson.props.version as number;
    }
  }

  return projectJson;
}