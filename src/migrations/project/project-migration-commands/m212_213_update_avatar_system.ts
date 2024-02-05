import { RT, rtp } from "../../../r/R/index.js";
import { r } from "../../../r/index.js";
import { IOrder } from "../../IOrder.js";

class Migration implements IOrder {
  execute (projectJson: any) {
    return migrateProject(projectJson);
  }
}

/**
 * Delete AvatarBodyType from project properties
 * 
 * AvatarSystem Enum update:
 * 
 * OLD:
 * export enum AvatarSystem {
 *   basic = "basic",
 *   basic_custom = "basic_custom",
 *   basic_rpm = "basic_rpm",
 *   none = "none" 
 * }
 * 
 * new AvatarSystem:
 * export enum AvatarSystem {
 *   none = "none", (default)
 *   rpm = "rpm",
 *   custom = "custom",
 * }
 * 
 * basic - rpm
 * basic_custom - custom
 * basic_rpm - rpm
 * none - none
 */
const migrateProject = (json: any) => {
  const projectF = r.project(json);
  const avatarSystem = projectF.getValueOrDefault(rtp.project.avatar_system);
  switch(avatarSystem) {
    case "basic":
    case "basic_rpm": {
      projectF.set(rtp.project.avatar_system, "rpm");
      break;
    }
    case "basic_custom": {
      projectF.set(rtp.project.avatar_system, "custom");
      break;
    }
    case "none": {
      //do nothing;
      break;
    }
  }
  projectF.delete("avatar_system_body_type");
  
  projectF.set(rtp.project.version, 213);
  return json;
}

const migration = new Migration();
export default migration;
