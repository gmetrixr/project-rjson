import { RT, rtp } from "../../../r/R/index.js";
import { r } from "../../../r/index.js";
import { IOrder } from "../../IOrder.js";
import { AvatarSystem } from "../../../r/definitions/project/index.js";

class Migration implements IOrder {
  execute(projectJson: any) {
    return migrateProject(projectJson);
  }
}

const migrateProject = (json: any) => {
  const projectF = r.project(json);
  const avatarOption = projectF.get(rtp[RT.project].avatar_system) as string;
  switch (avatarOption) {
    case "basic_custom": {
      projectF.set(rtp.project.avatar_system, AvatarSystem.custom);
      break;
    }
    case "basic":
    case "basic_rpm": {
      projectF.set(rtp.project.avatar_system, AvatarSystem.rpm);
      break;
    }
  }

  projectF.set(rtp.project.version, 217);
  return json;
};

const migration = new Migration();
export default migration;