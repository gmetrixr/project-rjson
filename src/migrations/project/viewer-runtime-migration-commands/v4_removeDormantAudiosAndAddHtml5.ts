import { rtp, RT, RecordFactory, RecordMap } from "../../../r/R";
import { IOrder } from "../../IOrder";
import { ElementFactory, ProjectFactory, SceneFactory } from "../../../r/recordFactories";
import { RuleAction } from "../../../r/definitions/rules";
import { ElementType } from "../../../r/definitions/elements";

class Migration implements IOrder {
  execute (projectJson: any) {
    return migrateProject(projectJson);
  }
}

/**
 * Prefer html5 audio to webaudio
 * Html5 audio is streamed. But it doesn't allow setting volume - either initially (via properties) or at runtime (via rules)
 * Web audio is buffered. But then it uses a LOT of memory
 * 
 * If there's an audio element with volue 100 and no set volume rules, set its use_html5_audio property to true
 * 
 * If there's an audio element with no thenAction, then we can safely delete it (audios don't autoplay). This will prevent
 * loading them during scene loading.
 */
const migrateProject = (json: any) => {
  const projectF = new ProjectFactory(json);
  const scenes = projectF.getRecords(RT.scene);

  for(const scene of scenes) {
    const sceneF = new SceneFactory(scene);
    
    //* 1. Find all audio elements that have a linked_element_id
    const deepElements = sceneF.getDeepRecordEntries(RT.element);
    const htmlAudios: RecordMap<RT.element> = {};
    const audiosToDelete: RecordMap<RT.element> = {};
    for(const [eId, element] of deepElements) {
      const elementF = new ElementFactory(element);
      if(elementF.get(rtp.element.element_type) === ElementType.audio || elementF.get(rtp.element.element_type) === ElementType.audio_ssml) {
        audiosToDelete[eId] = element;
        if(elementF.getValueOrDefault(rtp.element.volume) === 100) {
          htmlAudios[eId] = element;
        }
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
          //Volume code in AudioR.tsx:
          //  const volume = Number(triggeredAction.properties[0] ?? 100);
          //  audioInstance.current?.setVolume(volume / 100);
          //(triggeredAction.properties are created using thenAction.props.ta_properties)
          // const volume = Number((ta.props.ta_properties as vn.ArrayOfValues)?.[0] ?? 100);
          if(ta.props.ta_co_type === RuleAction.volume) {
            if(typeof ta.props.ta_co_id === "number") {
              delete htmlAudios[ta.props.ta_co_id];
            }
          }
        }
      }
    }

    for(const element of Object.values(htmlAudios)) {
      element.props.use_html5_audio = true;
    }
    for(const eId of Object.keys(audiosToDelete)) {
      sceneF.deleteDeepRecord(eId);
    }
  }
  return json;
}

const migration = new Migration();
export default migration;
