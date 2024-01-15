import { RT, RecordNode, createRecord } from "../../../r/R/index.js";
import { IOrder } from "../../IOrder.js";
import { sn } from "../../../r/definitions/index.js";
import { ProjectFactory } from "../../../r/recordFactories/ProjectFactory.js";
import { ProjectUtils } from "../../../r/recordFactories/ProjectUtils.js";

/**
 * Adds predefined variables to the project json
 */
class Migration implements IOrder {
  execute(projectJson: unknown) {
    const pJson = projectJson as RecordNode<RT.project>;
    const scene = createRecord(RT.scene);
    scene.props.scene_type = sn.SceneType.six_dof;
    const projectF = new ProjectFactory(pJson);
    const sceneIdAndRecord = projectF.addRecord({ record: scene });
    if (sceneIdAndRecord) {
      ProjectUtils.setupNewScene(pJson, sceneIdAndRecord);
    }
  }
}

const migration = new Migration();
export default migration;
