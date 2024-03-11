import { RT, rtp } from "../../../r/R/index.js";
import { r } from "../../../r/index.js";
import { IOrder } from "../../IOrder.js";
import { en } from "../../../r/definitions/index.js";
import { CharacterBrainType } from "../../../r/definitions/elements/index.js";

class Migration implements IOrder {
  execute(projectJson: any) {
    return migrateProject(projectJson);
  }
}

const migrateProject = (json: any) => {
  const projectF = r.project(json);
  const characterElements = projectF.getDeepRecordEntries(RT.element).filter(([, e]) => e.props.element_type === en.ElementType.character);
  for(const [, e] of characterElements) {
    const eF = r.element(e);

    // If any element is using ai features, then set the correct brain type to advanced
    if(eF.get(rtp.element.use_ai_brain)) {
      eF.set(rtp.element.character_brain_type, CharacterBrainType.advanced);
    }
  }

  projectF.set(rtp.project.version, 216);
  return json;
};

const migration = new Migration();
export default migration;