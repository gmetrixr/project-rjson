import { r } from "../../../index.js";
import { RT, rtp } from "../../../r/R/index.js";
import { IOrder } from "../../IOrder.js";

class Migration implements IOrder {
  execute(projectJson: any) {
    return migrateProject(projectJson);
  }
}

/**
 * collider_box is an old enum.
 * There was a migration in project/rjson to rename these to collider_volume, but the enum wan't deleted
 * At a few places, element_type is still collider_box
 * These projects that open in the editor but not in the viewer.
 * This is a migration to delete those leftover elements causing problems.
 */
const migrateProject = (json: any) => {
  const pf = r.project(json);
  const scenes = pf.getRecords(RT.scene);
  for (const scene of scenes) {
    const sf = r.scene(scene);
    const deepElements = sf.getDeepRecordEntries(RT.element);
    // * find out any old collider_box element and delete them (they aren't working anyway)
    for(const [eId, e] of deepElements) {  
      if(e.props.element_type === "collider_box") {
        sf.deleteDeepRecord(eId);
      }
    }
  }
  pf.set(rtp.project.version, 218);
  return json;
}

const migration = new Migration();
export default migration;
