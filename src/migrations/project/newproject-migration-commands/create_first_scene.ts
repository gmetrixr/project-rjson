import { createRecord, RecordNode, RT, sn } from "../../../r";
import { IOrder } from "../../IOrder";
import { ProjectFactory, ProjectUtils } from "../../../r/recordFactories/ProjectFactory";

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
