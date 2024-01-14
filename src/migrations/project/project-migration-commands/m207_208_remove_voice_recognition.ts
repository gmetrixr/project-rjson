import { rtp, RT } from "../../../r/R/index.js";
import { IOrder } from "../../IOrder.js";
import { ProjectFactory, SceneFactory } from "../../../r/recordFactories/index.js";

class Migration implements IOrder {
  execute (projectJson: any) {
    return migrateProject(projectJson);
  }
}

/**
 * Voice Recognition element was removed. Remove it from project graph
 */
const migrateProject = (json: any) => {
  const pf = new ProjectFactory(json);
    const scenes = pf.getRecords(RT.scene);
    for(const s of scenes) {
      const sceneF = new SceneFactory(s);
      // * find out any speech elements and delete them
      const deepElements = sceneF.getDeepRecordEntries(RT.element);
      for(const [id, e] of deepElements) {
        if(e.props.element_type === "speech") {
          sceneF.deleteDeepRecord(id);
        }
      }
    }
  
  pf.set(rtp.project.version, 208);
  return json;
}

const migration = new Migration();
export default migration;
