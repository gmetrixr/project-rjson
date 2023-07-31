import { RecordNode, rtp, RT } from "../../../r/R";
import { IOrder } from "../../IOrder";
import { ProjectFactory, SceneFactory } from "../../../r/recordFactories";
import { jsUtils } from "@gmetrixr/gdash";

const { generateIdV2 } = jsUtils;

class Migration implements IOrder {
  execute (projectJson: any) {
    return migrateProject(projectJson);
  }
}

/**
 * Makes sure all element ids in all scenes are unique
 * In the previous migration from v5 to v6, because of running migration at project level, there are still 
 * duplicate element ids across scenes
 */
const migrateProject = (json: any) => {
  const pf = new ProjectFactory(json as RecordNode<RT.project>);

  const listOfElementIdsUsed: number[] = [];
  for(const scene of pf.getRecords(RT.scene)) {
    const scenef = new SceneFactory(scene);
    const replacementMap: {[oldId: number]: number} = {};
    //Do this only for affected scenes, not all scenes. Don't want it to impact all projects
    let isSceneCorrupt = false;
    for(const [eId, element] of scenef.getDeepRecordEntries(RT.element)) {
      if(listOfElementIdsUsed.includes(eId)) {
        replacementMap[eId] = generateIdV2();
        isSceneCorrupt = true;
      }
    }
    if(isSceneCorrupt) {
      // scenef.cycleAllSubRecordIds();
      scenef.replaceAllSubRecordIds(replacementMap);
      scenef.replaceAllSubRecordIdsInProperties(replacementMap);
    }
    for(const [eId, element] of scenef.getDeepRecordEntries(RT.element)) {
      listOfElementIdsUsed.push(eId);
    }
  }
  
  pf.set(rtp.project.version, 206);
  return json;
}

const migration = new Migration();
export default migration;
