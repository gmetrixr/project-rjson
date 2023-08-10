
import { RT, RecordNode, createRecord, r, rtp } from "../../../r";
import { IOrder } from "../../IOrder";
import v1 from "./v1_removeDormantRules";
import v2 from "./v2_removeDormantElements";
import v3 from "./v3_removeDormantScenes";
import v4 from "./v4_removeDormantAudiosAndAddHtml5";
import v5 from "./v5_addLinkedPopupRules";

const viewerRuntimeMigrationTree: {[key: number]: IOrder} = {
  [1]: v1,
  [2]: v2,
  [3]: v3,
  [4]: v4,
  [5]: v5,
};

const viewerMigrationVersions: number[] = Object.keys(viewerRuntimeMigrationTree).map(numStr => parseInt(numStr)).sort((a, b) => (a - b));

/**
 * Migrations to be run only on a new project (once)
 */
export const runViewerRuntimeMigrations = (projectJson: any): RecordNode<RT.project> => {
  const rProjectJson = projectJson as RecordNode<RT.project>;
  for(const key of viewerMigrationVersions) {
    viewerRuntimeMigrationTree[key].execute(rProjectJson);
  }
  return rProjectJson;
}
