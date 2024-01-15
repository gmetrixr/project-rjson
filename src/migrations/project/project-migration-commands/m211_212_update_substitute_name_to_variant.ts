import { RT, rtp } from "../../../r/R/index.js";
import { r } from "../../../r/index.js";
import { IOrder } from "../../IOrder.js";

class Migration implements IOrder {
  execute (projectJson: any) {
    return migrateProject(projectJson);
  }
}

const migrateProject = (json: any) => {
  const projectF = r.project(json);
  const scenes = projectF.getRecords(RT.scene);

  for (const scene of scenes) {
    const sceneF = r.scene(scene);
    const substituteRecords = sceneF.getDeepRecordEntries(RT.substitute);

    for (const [id, record] of substituteRecords) {
      if (record.name?.includes("Substitute")) {
        sceneF.changeDeepRecordName(id);
      }
    }
  }

  projectF.set(rtp.project.version, 212);
  return json;
}

const migration = new Migration();
export default migration;