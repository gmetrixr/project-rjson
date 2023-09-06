import { RT, r, rn, rtp } from "../../../r";
import { VarValue } from "../../../r/definitions/variables";
import { IOrder } from "../../IOrder";

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
    const thenActions = sceneF.getDeepRecordEntries(RT.then_action);

    const filteredThenActions = thenActions.filter(([ _, ta ]) => ta.props.action === rn.RuleAction.talk);

    for (const [ _taId, taRecord ] of filteredThenActions) {
      const taF = r.record(taRecord);
      const properties = taF.get(rtp.then_action.ta_properties) as VarValue[];
      properties.unshift("TALK_001");
    }
  }

  projectF.set(rtp.project.version, 211);
  return json;
}

const migration = new Migration();
export default migration;