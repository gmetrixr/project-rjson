import { jsUtils } from "@gmetrixr/gdash";
import { RecordFactory, RecordUtils } from "../R/RecordFactory";
import { RecordNode, idAndRecord, idOrAddress } from "../R/RecordNode";
import { RT } from "../R/RecordTypes";
import { ThenActionProperty } from "../recordTypes/ThenAction";
import { WhenEventProperty } from "../recordTypes/WhenEvent";
import { TopicProperty } from "../recordTypes/Topic";
import { SceneProperty } from "../recordTypes/Scene";
import { TourModeProperty } from "../recordTypes/TourMode";
import { ElementProperty } from "../recordTypes/Element";
import { LeadGenFieldProperty } from "../recordTypes/LeadGenField";

const { generateIdV2 } = jsUtils;

export class SceneFactory extends RecordFactory<RT.scene> {
  constructor(json: RecordNode<RT.scene>) {
    super(json);
  }

  /** Overriding delete element: Deleting an element/variable (any CogObject) should also delete its rules */
  deleteRecord <N extends RT>(id: number, type?: N): idAndRecord<N> | undefined {
    if(type === RT.element) {
      this.deleteRulesForCoId(id);
    }
    return super.deleteRecord(id, type);
  }

  /** Overriding delete deep element: Deleting an element/variable (any CogObject) should also delete its rules */
  deleteDeepRecord <N extends RT>(idOrAddress: idOrAddress): idAndRecord<N> | undefined {
    const recordToDeleteRAndP = this.getRecordAndParent(idOrAddress);
    if(recordToDeleteRAndP !== undefined) {
      if(recordToDeleteRAndP.r.type === RT.element) {
        this.deleteRulesForCoId(recordToDeleteRAndP.id);
      }
      return super.deleteDeepRecord(idOrAddress);
    }
  }

  //ELEMENT SPECIFIC FUNCTIONS
  /** Given a CogObject (element/varaible), delete all rules associated with it */
  deleteRulesForCoId (id: number): void {
    //Get the rules for this scene
    for(const [ruleId, rule] of this.getRecordEntries(RT.rule)) {
      const ruleF = new RecordFactory(rule);
      ruleF.getRecordEntries(RT.when_event)
        .filter(([weId, we]) => (we.props.we_co_id === id))
        .forEach(([weId, we]) => ruleF.deleteRecord(weId, RT.when_event));
      ruleF.getRecordEntries(RT.then_action)
        .filter(([taId, ta]) => (ta.props.ta_co_id === id))
        .forEach(([taId, ta]) => ruleF.deleteRecord(taId, RT.then_action));
      if(ruleF.getRecords(RT.when_event).length === 0 && ruleF.getRecords(RT.then_action).length === 0) {
        this.deleteRecord(ruleId, RT.rule);
      }
    }
  }

  /** 
   * Using this only to cycle rule ids
   */
  cycleAllSubRecordIdsForRulesFix(): void {
    const replacementMap: {[oldId: number]: number} = {};
    //Contains all rule ids, and we and ta ids present in this scene
    for(const [id, ruleJson] of this.getRecordEntries(RT.rule)) {
      const oldId = Number(id);
      const newId = generateIdV2();
      replacementMap[oldId] = newId;
      for(const [key, value] of new RecordFactory(ruleJson).getRecordEntries()) { //This will get when event and then actions
        const oldId = Number(key);
        const newId = generateIdV2();
        replacementMap[oldId] = newId;
      }
    }
    this.replaceAllSubRecordIds(replacementMap);
    this.replaceAllSubRecordIdsInProperties(replacementMap);
  }

  replaceAllSubRecordIds(replacementMap: {[oldId: number]: number}) {
    const allPAndRs = RecordUtils.getDeepRecordAndParentArray(this._json, []);
    for(const pAndR of allPAndRs) {
      const {id, p, r} = pAndR;
      const oldId = id;
      //Change Record Id
      if(oldId in replacementMap) {
        const newId = replacementMap[id];
        const type = r.type as RT;
        const recordMapOfType = new RecordFactory(p).getRecordMap(type);
        recordMapOfType[newId] = recordMapOfType[oldId];
        delete recordMapOfType[oldId];
      }
    }
  }

  replaceAllSubRecordIdsInProperties(replacementMap: {[oldId: number]: number}) {
    this.changeRecordIdInProperties(replacementMap);
    const allPAndRs = RecordUtils.getDeepRecordAndParentArray(this._json, []);
    for(const pAndR of allPAndRs) {
      SceneUtils.changeRecordIdInProperties(pAndR.r, replacementMap);
    }
  }
}

export class SceneUtils {
  static changeRecordIdInProperties(record: RecordNode<RT>, replacementMap: {[oldId: number]: number}): boolean {
    for(const prop of Object.keys(record.props)) {
      const currentValue = (record.props as unknown as any)[prop];
      if(!SceneUtils.propertiesWhitelist.includes(prop)) {
        continue;
      }
      if(Array.isArray(currentValue)) {
        for(let i = 0; i < currentValue.length; i++) {
          if(Number(currentValue[i]) in replacementMap) {
            const oldId = Number(currentValue[i]);
            const newId = replacementMap[oldId];
            currentValue[i] = newId;
          }
        }
      } else if(typeof currentValue === "number") {
        if(currentValue in replacementMap) {
          (record.props as unknown as any)[prop] = replacementMap[currentValue];
        }
      } else if(typeof currentValue === "string") {
        if(Number(currentValue) in replacementMap) {
          (record.props as unknown as any)[prop] = replacementMap[Number(currentValue)];
        }
      }
    }
    return true;
  }

  static propertiesWhitelist = [
    ElementProperty.target_element_id,
    ElementProperty.media_upload_var_id,
    ElementProperty.target_scene_id,
    ElementProperty.embed_scorm_score_var_id,
    ElementProperty.embed_scorm_suspend_data_var_id,
    ElementProperty.embed_scorm_progress_var_id,
    ElementProperty.linked_element_id,
    ThenActionProperty.ta_co_id,
    ThenActionProperty.ta_properties,
    WhenEventProperty.we_co_id,
    WhenEventProperty.we_properties,
    SceneProperty.scene_orbit_target_element_id,
    SceneProperty.scene_spawn_zone_id,
    SceneProperty.linked_menu_id,
    SceneProperty.linked_tour_mode_id,
    LeadGenFieldProperty.var_id,
    TourModeProperty.tour_mode_scene_id,
    TopicProperty.topic_scene_id,
    "co_id", //The id cycle migration runs before the when event and then action properties were renamed
    "properties"
  ]
}
