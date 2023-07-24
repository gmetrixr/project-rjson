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
 * In prevous migration, shopping record id=1 caused a lot of issues. In the replacement map this was caught, and a lot of properties
 * got changed from 0 to that number.
 * How to fix?
 * Get the id of the shopping record. Is it > 1? If yes, this is a project that needs fixing.
 * Go through all props, and anything that matches this (big) number, should be set to 1.
 */
const migrateProject = (json: any) => {
  const pf = new ProjectFactory(json as RecordNode<RT.project>);
  //Get shopping id
  const shoppingEntry = pf.getRecordEntries(RT.shopping);
  const shopping_id = shoppingEntry?.[0]?.[0] ?? 0;
  if(shopping_id > 1) { 
    //If we are here, we need to fix all properties that match this value
    //We need to replace shopping_id with 1
    const allTypesInProject = pf.getRecordTypes();
    for(const type of allTypesInProject) {
      //Don't go through scenes here because different scenes may 
      //have element ids that are same
      for(const [id, record] of pf.getDeepRecordEntries(type)) { 
        new RecordFactory(record).changeRecordIdInProperties({[shopping_id]: 1});
      }
    }

    for(const [sceneId, scene] of pf.getRecordEntries(RT.scene)) {
      const sf = new RecordFactory(scene);
      for(const [id, record] of sf.getDeepRecordEntries()) { 
        new RecordFactory(record).changeRecordIdInProperties({[shopping_id]: 1});
      }
    }
  }
  
  pf.set(rtp.project.version, 204);
  return json;
}

const migration = new Migration();
export default migration;
