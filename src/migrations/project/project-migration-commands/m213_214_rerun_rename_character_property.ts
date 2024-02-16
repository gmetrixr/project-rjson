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
  const characterElements = projectF
    .getDeepRecordEntries(RT.element)
    .filter(([id, e]) => e.props.element_type === en.ElementType.character);

  for (const [id, e] of characterElements) {
    const factory = r.element(e);
    factory.changePropertyName("brain_slug", "character_brain_slug");
  }

  projectF.set(rtp.project.version, 214);
  return json;
};

const migration = new Migration();
export default migration;