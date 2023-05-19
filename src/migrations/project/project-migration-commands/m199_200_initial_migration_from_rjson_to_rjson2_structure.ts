import { RecordNode, rtp, RT, RecordFactory } from "../../../r/R";
import { IOrder } from "../../IOrder";

class Migration implements IOrder {
  execute (projectJson: any) {
    return migrateProject(projectJson);
  }
}

const migrateProject = (json: any) => {
  delete json.id;
  const updatedJson = removeDeepIdsFromRecord(json);
  const projectJson = updatedJson as unknown as RecordNode<RT.project>;
  const projectF = new RecordFactory(projectJson)
  projectF.set(rtp.project.version, 200);
  return projectJson;
}

const removeDeepIdsFromRecord = (json: any) => {
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
      records[key][recKey] = removeDeepIdsFromRecord(records[key][recKey]);
    }
  }

  return json;
}

const migration = new Migration();
export default migration;