import { RecordNode, RT, sn } from "../../../r";
import { IOrder } from "../../IOrder";
import { ProjectUtils } from "../../../r/recordFactories/ProjectFactory";

/**
 * Adds predefined variables to the project json
 */
class Migration implements IOrder {
  execute(projectJson: unknown) {
    const pJson = projectJson as RecordNode<RT.project>;
    ProjectUtils.addNewScene(pJson, sn.SceneType.six_dof);
  }
}

const migration = new Migration();
export default migration;
