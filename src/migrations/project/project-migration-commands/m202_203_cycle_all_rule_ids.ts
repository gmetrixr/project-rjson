import { RT, rtp, RecordNode } from "../../../r/R/index.js";
import { RF } from "../../../r/index.js";
import { IOrder } from "../../IOrder.js";

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
  const pf = new RF.ProjectFactory(json as RecordNode<RT.project>);
  //Change all rule ids
  for(const scene of pf.getRecords(RT.scene)) {
    const scenef = new RF.SceneFactory(scene);
    scenef.cycleAllSubRecordIdsForRulesFix();
  }

  //In migration 200 a few rules got missed out because getDeepRecordEntries can't select two rules with the same id
  for(const [rId, record] of pf.getDeepRecordEntries()) {
    switch(record.type) {
      case RT.then_action: {
        const rf = new RF.RecordFactory(record);
        rf.changePropertyName("co_id", "ta_co_id");
        rf.changePropertyName("co_type", "ta_co_type");
        rf.changePropertyName("properties", "ta_properties");
        rf.changePropertyName("delay", "ta_delay");
        break;
      }
      case RT.when_event: {
        const rf = new RF.RecordFactory(record);
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
