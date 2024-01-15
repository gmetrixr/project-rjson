import { rtp } from "../../../r/R/index.js";
import { RF } from "../../../r/index.js";
import { IOrder } from "../../IOrder.js";
import { pn } from "../../../r/definitions/index.js";
import { ProjectProperty } from "../../../r/recordTypes/Project.js";

class Migration implements IOrder {
  execute (projectJson: any) {
    return migrateProject(projectJson);
  }
}

/**
 * For older projects set scene_transition_type to blend.
 * The new default value is fade_to_black - which is the new behaviour.
 * But so that older behaviour is maintained, we set this manually to blend for older projects
 */
const migrateProject = (json: any) => {
  const pf = new RF.ProjectFactory(json);
  if(pf.get(ProjectProperty.scene_transition_type) === undefined) {
    pf.set(ProjectProperty.scene_transition_type, pn.SceneTransitionType.blend);
  }
  pf.set(rtp.project.version, 210);
  return json;
}

const migration = new Migration();
export default migration;
