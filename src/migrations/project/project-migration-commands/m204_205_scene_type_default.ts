import { RT, rtp, RecordNode } from "../../../r/R/index.js";
import { RF } from "../../../r/index.js";
import { IOrder } from "../../IOrder.js";
import { SceneType } from "../../../r/definitions/special/index.js";

class Migration implements IOrder {
  execute (projectJson: any) {
    return migrateProject(projectJson);
  }
}

/**
 * If scene_type is not present, make it first_person (360 scene)
 */
const migrateProject = (json: any) => {
  const pf = new RF.ProjectFactory(json as RecordNode<RT.project>);

  for(const scene of pf.getRecords(RT.scene)) {
    const scenef = new RF.SceneFactory(scene);
    const sceneTypeInProps = scenef.get(rtp.scene.scene_type);
    if(sceneTypeInProps === undefined) {
      scenef.set(rtp.scene.scene_type, SceneType.first_person);
    }
  }
  
  pf.set(rtp.project.version, 205);
  return json;
}

const migration = new Migration();
export default migration;
