
import { RT, RecordNode } from "../../../r/R/index.js";
import { IOrder } from "../../IOrder.js";
import v1 from "./v1_removeDormantRules.js";
import v2 from "./v2_removeDormantElements.js";
import v3 from "./v3_removeDormantScenes.js";
import v4 from "./v4_removeDormantAudios.js";
import v5 from "./v5_addLinkedPopupRules.js";

const viewerRuntimeMigrationTree: {[key: number]: IOrder} = {
  [1]: v1,
  [2]: v2,
  [3]: v3,
  [4]: v4,
  [5]: v5,
};
const previewerRuntimeMigrationTree: {[key: number]: IOrder} = {
  [1]: v1,
  [2]: v2,
  //DO NOT delete dormant scenes for previews. Only views. As the editor might create unreachable scenes and test
  //[3]: v3,
  [4]: v4,
  [5]: v5,
};

const viewerMigrationVersions: number[] = Object.keys(viewerRuntimeMigrationTree).map(numStr => parseInt(numStr)).sort((a, b) => (a - b));
const previewerMigrationVersions: number[] = Object.keys(previewerRuntimeMigrationTree).map(numStr => parseInt(numStr)).sort((a, b) => (a - b));
 
/** Migrations to be run just before viewing a project */
export const projectViewerRuntimeMigrations = (projectJson: any): RecordNode<RT.project> => {
  const rProjectJson = projectJson as RecordNode<RT.project>;
  for(const key of viewerMigrationVersions) {
    viewerRuntimeMigrationTree[key].execute(rProjectJson);
  }
  return rProjectJson;
}

/** Migrations to be run just before viewing a project */
export const projectPreviewerRuntimeMigrations = (projectJson: any): RecordNode<RT.project> => {
  const rProjectJson = projectJson as RecordNode<RT.project>;
  for(const key of previewerMigrationVersions) {
    previewerRuntimeMigrationTree[key].execute(rProjectJson);
  }
  return rProjectJson;
}
