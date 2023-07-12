import { RecordNode, rtp, RT } from "../../../r/R";
import { IOrder } from "../../IOrder";
import { ProjectUtils } from "../../../r/recordFactories/ProjectFactory";
import { ProjectFactory } from "../../../r/recordFactories";

class Migration implements IOrder {
  execute (projectJson: any) {
    return migrateProject(projectJson);
  }
}

const migrateProject = (json: any) => {
  delete json.id;
  const updatedJson = recursivelyMigrateJson(json);
  const projectJson = updatedJson as unknown as RecordNode<RT.project>;
  ProjectUtils.ensureNoDuplicateIdsInProject(projectJson);
  const projectF = new ProjectFactory(projectJson);
  projectF.set(rtp.project.version, 200);
  return projectJson;
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