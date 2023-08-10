import { rtp, RT, RecordFactory, RecordMap, createRecord } from "../../../r/R";
import { IOrder } from "../../IOrder";
import { ElementFactory, ProjectFactory, SceneFactory } from "../../../r/recordFactories";
import { RuleAction, RuleEvent } from "../../../r/definitions/rules";
import { ElementType } from "../../../r/definitions/elements";

class Migration implements IOrder {
  execute (projectJson: any) {
    return migrateProject(projectJson);
  }
}


const migrateProject = (json: any) => {
  const projectF = new ProjectFactory(json);
  const scenes = projectF.getRecords(RT.scene);

  for(const scene of scenes) {
    const sceneF = new SceneFactory(scene);
    
    //* 1. Find all image and video elements that have a linked_element_id
    const deepElements = sceneF.getDeepRecordEntries(RT.element);
    const originalElements = deepElements.filter(([ _, element ]) => {
      const elementF = new ElementFactory(element);
      return elementF.getValueOrDefault(rtp.element.linked_element_id) !== undefined && elementF.getValueOrDefault(rtp.element.element_type) !== ElementType.popup;
    });

    //* 2. Check whether the element does in fact exist
    for(const [ oeId, oe ] of originalElements) {
      const elementF = new ElementFactory(oe);
      const linkedElementId = elementF.getValueOrDefault(rtp.element.linked_element_id) as number;
      const linkedPopup = sceneF.getRecord(linkedElementId);

      if(linkedPopup !== undefined) {
        //* 3. Add new rule that opens linked popup on clicking original element
        const newRule = createRecord(RT.rule);
        const ruleF = new RecordFactory(newRule);

        const newWhenEvent = createRecord(RT.when_event);
        const whenEventF = new RecordFactory(newWhenEvent);
        whenEventF.set(rtp.when_event.we_co_id, oeId);
        whenEventF.set(rtp.when_event.we_co_type, oe.props.element_type);
        whenEventF.set(rtp.when_event.event, RuleEvent.on_click);
        whenEventF.set(rtp.when_event.we_properties, []);

        const newThenAction = createRecord(RT.then_action);
        const thenActionF = new RecordFactory(newThenAction);
        thenActionF.set(rtp.then_action.ta_co_id, oe.props.linked_element_id);
        thenActionF.set(rtp.then_action.ta_co_type, ElementType.popup);
        thenActionF.set(rtp.then_action.action, RuleAction.show);
        thenActionF.set(rtp.then_action.ta_properties, []);

        ruleF.addRecord({ record: newWhenEvent, dontCycleSubRecordIds: true });
        ruleF.addRecord({ record: newThenAction, dontCycleSubRecordIds: true });
        sceneF.addRecord({ record: newRule, dontCycleSubRecordIds: true });
      }
    }
  }
  return json;
}

const migration = new Migration();
export default migration;
