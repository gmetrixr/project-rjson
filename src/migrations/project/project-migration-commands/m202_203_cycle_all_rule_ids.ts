import { RecordNode, rtp, RT, RecordFactory } from "../../../r/R/index.js";
import { IOrder } from "../../IOrder.js";
import { ProjectFactory, SceneFactory } from "../../../r/recordFactories/index.js";

class Migration implements IOrder {
  execute (projectJson: any) {
    return migrateProject(projectJson);
  }
}

/**
 * Add prefix ta and we to ThenAction and WhenEvent properties
 *   ta_co_id = "ta_co_id",
  ta_co_type = "ta_co_type",
  action = "action",
  ta_properties = "ta_properties",
  ta_delay = "ta_delay",
 */
const migrateProject = (json: any) => {
  const pf = new ProjectFactory(json as RecordNode<RT.project>);
  //Change all rule ids
  for(const scene of pf.getRecords(RT.scene)) {
    const scenef = new SceneFactory(scene);
    scenef.cycleAllSubRecordIdsForRulesFix();
  }

  //In migration 200 a few rules got missed out because getDeepRecordEntries can't select two rules with the same id
  for(const [rId, record] of pf.getDeepRecordEntries()) {
    switch(record.type) {
      case RT.then_action: {
        const rf = new RecordFactory(record);
        rf.changePropertyName("co_id", "ta_co_id");
        rf.changePropertyName("co_type", "ta_co_type");
        rf.changePropertyName("properties", "ta_properties");
        rf.changePropertyName("delay", "ta_delay");
        break;
      }
      case RT.when_event: {
        const rf = new RecordFactory(record);
        rf.changePropertyName("co_id", "we_co_id");
        rf.changePropertyName("co_type", "we_co_type");
        rf.changePropertyName("properties", "we_properties");
        break;
      }
    }
  }
  
  pf.set(rtp.project.version, 203);
  return json;
}

const migration = new Migration();
export default migration;
