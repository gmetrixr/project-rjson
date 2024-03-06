import { RT, rtp } from "../../../r/R/index.js";
import { r } from "../../../r/index.js";
import { IOrder } from "../../IOrder.js";
import { en } from "../../../r/definitions/index.js";

class Migration implements IOrder {
  execute(projectJson: any) {
    return migrateProject(projectJson);
  }
}

const migrateProject = (json: any) => {
  const projectF = r.project(json);
  const tapToStart = projectF.get(rtp.project.show_tap_to_start_mobile)
  if(tapToStart === undefined) {
    projectF.set(rtp.project.show_tap_to_start_mobile, false);
  }
  projectF.set(rtp.project.version, 215);
  return json;
};

const migration = new Migration();
export default migration;