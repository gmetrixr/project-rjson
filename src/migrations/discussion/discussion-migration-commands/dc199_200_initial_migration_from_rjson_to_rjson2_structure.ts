import { RecordNode, rtp, RT, RecordFactory } from "../../../r/R";
import { IOrder } from "../../IOrder";

class Migration implements IOrder {
  execute (discussionJson: any) {
    return migrateDiscussion(discussionJson);
  }
}

const migrateDiscussion = (json: any) => {
  delete json.id;
  const updatedJson = recursivelyMigrateJson(json);
  const discussionJson = updatedJson as unknown as RecordNode<RT.discussion>;
  const discussionF = new RecordFactory(discussionJson)
  discussionF.set(rtp.discussion.version, 200);
  return discussionJson;
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