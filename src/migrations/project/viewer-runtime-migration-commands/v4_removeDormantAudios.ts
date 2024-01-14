import { rtp, RT, RecordFactory, RecordMap } from "../../../r/R/index.js";
import { IOrder } from "../../IOrder.js";
import { ElementFactory, ProjectFactory, SceneFactory } from "../../../r/recordFactories/index.js";
import { RuleAction } from "../../../r/definitions/rules/index.js";
import { ElementType } from "../../../r/definitions/elements/index.js";

class Migration implements IOrder {
  execute (projectJson: any) {
    return migrateProject(projectJson);
  }
}

/**
 * If there's an audio element with no thenAction, then we can safely delete it (audios don't autoplay). This will prevent
 * loading them during scene loading.
 */
const migrateProject = (json: any) => {
  const projectF = new ProjectFactory(json);
  const scenes = projectF.getRecords(RT.scene);

  for(const scene of scenes) {
    const sceneF = new SceneFactory(scene);
    
    //* 1. Find all audio elements
    const deepElements = sceneF.getDeepRecordEntries(RT.element);
    const audiosToDelete: RecordMap<RT.element> = {};
    for(const [eId, element] of deepElements) {
      const elementF = new ElementFactory(element);
      if(elementF.get(rtp.element.element_type) === ElementType.audio || elementF.get(rtp.element.element_type) === ElementType.audio_ssml) {
        audiosToDelete[eId] = element;
      }
    }

    //* 2. Check if there are volume rules for these audio elements
    for(const [ruleId, rule] of sceneF.getSortedRecordEntries(RT.rule)) {
      const ruleF = new RecordFactory(rule);
      if(ruleF.getValueOrDefault(rtp.rule.disabled) !== false) {
        for(const [weId, we] of ruleF.getSortedRecordEntries(RT.when_event)) {
          if(typeof we.props.we_co_id === "number") { //If an audio element has a when event associated, don't delete it
            delete audiosToDelete[we.props.we_co_id];
          }
        }
        for(const [taId, ta] of ruleF.getSortedRecordEntries(RT.then_action)) {
          if(typeof ta.props.ta_co_id === "number") { //If an audio element has a then action associated, don't delete it
            delete audiosToDelete[ta.props.ta_co_id];
          }
        }
      }
    }

    for(const eId of Object.keys(audiosToDelete)) {
      sceneF.deleteDeepRecord(eId);
    }
  }
  return json;
}

const migration = new Migration();
export default migration;
