import { RecordNode, rtp, RT, RecordFactory } from "../../../r/R";
import { IOrder } from "../../IOrder";
import { ProjectFactory, SceneFactory } from "../../../r/recordFactories";
import { RecordUtils } from "../../../r/R/RecordFactory";

class Migration implements IOrder {
  execute (projectJson: any) {
    return migrateProject(projectJson);
  }
}

/**
 * Makes sure all element ids in all scenes are unique
 * In the previous migration a, because of running migration at project level, there are still 
 * duplicate element ids across scenes
 */
const migrateProject = (json: any) => {
  const pf = new ProjectFactory(json as RecordNode<RT.project>);

  for(const scene of pf.getRecords(RT.scene)) {
    const scenef = new SceneFactory(scene);
    //TODO: Do this only for affected scenes, not all scenes. Don't want it to impact all projects
    scenef.cycleAllSubRecordIds();
  }
  
  pf.set(rtp.project.version, 205);
  return json;
}

const migration = new Migration();
export default migration;
