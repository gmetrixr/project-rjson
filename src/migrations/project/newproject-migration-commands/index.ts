
import { RT, RecordNode, createRecord, r, rtp } from "../../../r";
import { IOrder } from "../../IOrder";
import { getHighestProjectVersion } from "../project-migration-commands";
import create_first_scene from "./create_first_scene";
import create_predefined_vars from "./create_predefined_vars";

export const newProjectMigrationTree: {[key: number]: IOrder} = {
  [1]: create_first_scene,
  [2]: create_predefined_vars,
};

export const createNewProject = (): RecordNode<RT.project> => {
  const project = createRecord(RT.project);
  const projectF = r.project(project);

  projectF.set(rtp.project.version, getHighestProjectVersion());
  runNewProjectMigrations(project);

  return project;
}
const newProjectMigrationVersions: number[] = Object.keys(newProjectMigrationTree).map(numStr => parseInt(numStr)).sort((a, b) => (a - b));

/**
 * Migrations to be run only on a new project (once)
 */
function runNewProjectMigrations(projectJson: any): RecordNode<RT.project> {
  const rProjectJson = projectJson as RecordNode<RT.project>;
  for(const key of newProjectMigrationVersions) {
    newProjectMigrationTree[key].execute(rProjectJson);
  }
  return rProjectJson;
}
