import { RecordNode, rtp, RT } from "../../../r/R";
import { IOrder } from "../../IOrder";
import { ProjectFactory } from "../../../r/recordFactories";
import { jsUtils } from "@gmetrixr/gdash";

const { generateIdV2 } = jsUtils;

class Migration implements IOrder {
  execute (projectJson: any) {
    return migrateProject(projectJson);
  }
}

const migrateProject = (json: any) => {
  delete json.id;
  const updatedJson = recursivelyMigrateJson(json);
  const projectJson = updatedJson as unknown as RecordNode<RT.project>;
  changeLeadGenAndShoppingIds(projectJson);
  const projectF = new ProjectFactory(projectJson);
  projectF.cycleAllSubRecordIdsForRulesFix();
  projectF.set(rtp.project.version, 200);
  return projectJson;
}

/**
 * Fix on 02-Aug-2023
 * Leadgen ids of 1 / 2 / 3 and shopping id of 1 cause problems with scenes with low ids 
 * (the elements within them don't change their ids)
 * And Leadgen ids and shopping ids aren't referenced from anywhere. So we can just move these ids to something random.
 */
const changeLeadGenAndShoppingIds = (projectJson: RecordNode<RT.project>) => {
  const projectF = new ProjectFactory(projectJson);
  const shoppingRecords = projectF.getRecords(RT.shopping);
  if(shoppingRecords.length > 0) {
    const shoppingRM = projectF.getRecordMap(RT.shopping);
    for(const [id, record] of projectF.getRecordEntries(RT.shopping)) {
      const oldId = id;
      const newId = generateIdV2();
      shoppingRM[newId] = shoppingRM[oldId];
      delete shoppingRM[oldId];
    }
  }
  const leadgenRecords = projectF.getRecords(RT.lead_gen_field);
  if(leadgenRecords.length > 0) {
    const leadgenRM = projectF.getRecordMap(RT.lead_gen_field);
    for(const [id, record] of projectF.getRecordEntries(RT.lead_gen_field)) {
      const oldId = id;
      const newId = generateIdV2();
      leadgenRM[newId] = leadgenRM[oldId];
      delete leadgenRM[oldId];
    }
  }
}

const recursivelyMigrateJson = (json: any) => {
  delete json.id;

  if (!json.records) return json;

  const records = json.records;

  for (const key in records) {
    const record = records[key];

    for (let i = 0; i < record.order.length; i++) {
      record.map[record.order[i]].order = i;
    }

    delete record.order;
    records[key] = record.map;
    delete records[key].map;

    for (const recKey in records[key]) {
      records[key][recKey] = recursivelyMigrateJson(records[key][recKey]);
    }
  }

  return json;
}

const migration = new Migration();
export default migration;