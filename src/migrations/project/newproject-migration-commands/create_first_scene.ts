import { createRecord, RecordNode, RT, sn } from "../../../r";
import { IOrder } from "../../IOrder";
import { ProjectUtils } from "../../../r/recordFactories/ProjectFactory";
import { jsUtils } from "@gmetrixr/gdash";

const { generateIdV2 } = jsUtils;

/**
 * Adds predefined variables to the project json
 */
class Migration implements IOrder {
  execute(projectJson: unknown) {
    const pJson = projectJson as RecordNode<RT.project>;
    const scene = createRecord(RT.scene);
    scene.props.scene_type = sn.SceneType.six_dof;
    const sceneId = generateIdV2();
    ProjectUtils.setupNewScene(pJson, { id: sceneId, record: scene });
  }
}

const migration = new Migration();
export default migration;
