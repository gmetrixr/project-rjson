import { rtp, RT, RecordFactory } from "../../../r/R/index.js";
import { IOrder } from "../../IOrder.js";
import { ElementFactory, ProjectFactory, SceneFactory } from "../../../r/recordFactories/index.js";
import { ElementType, elementList } from "../../../r/definitions/elements/index.js";
import { ElementProperty } from "../../../r/recordTypes/Element.js";
import { ArrayOfValues } from "../../../r/definitions/variables/index.js";
import { jsUtils } from "@gmetrixr/gdash";

const { difference } = jsUtils; 

class Migration implements IOrder {
  execute (projectJson: any) {
    return migrateProject(projectJson);
  }
}

/**
 * Remove elements that are:
 * 1) hidden and
 * 2) not referenced by rules
 */
const migrateProject = (json: any) => {
  const elementsWithHidden: ElementType[] = []
  for (const elementDef of elementList) {
    if(elementDef.properties.includes(ElementProperty.hidden)) {
      elementsWithHidden.push(elementDef.element_type);
    }
  }

  const projectF = new ProjectFactory(json);
  const scenes = projectF.getRecords(RT.scene);
  for(const s of scenes) {
    const sceneF = new SceneFactory(s);

    // * 1. Get all hidden elements
    const deepElementEntries = sceneF.getDeepRecordEntries(RT.element);
    const deleteElementIds: number[] = [];
    for(const [eId, e] of deepElementEntries) {
      const elementF = new ElementFactory(e);
      if(elementsWithHidden.includes(elementF.getElementType())) {
        if(elementF.getValueOrDefault(rtp.element.hidden) === true) {
          deleteElementIds.push(eId);
        }
      }
    }

    // * 2. Check for any rule on hidden elements
    const allPropValues: ArrayOfValues = [];
    const thenActionEntries = sceneF.getDeepRecordEntries(RT.then_action);
    for(const [taId, ta] of thenActionEntries) {
      const taF = new RecordFactory(ta);
      allPropValues.push(...taF.getAllPropValues() as ArrayOfValues);
    }
    
    const whenEventEntries = sceneF.getDeepRecordEntries(RT.when_event);
    for(const [weId, we] of whenEventEntries) {
      const weF = new RecordFactory(we);
      allPropValues.push(...weF.getAllPropValues() as ArrayOfValues);
    }
    
    const allPropValuesSet = new Set(allPropValues);
    const deleteElementIdsSet = new Set(deleteElementIds);
    const remainingDeleteElementIdsSet = difference(deleteElementIdsSet, allPropValuesSet);

    // * 3. Delete elements that don't appear in rules
    for(const id of Array.from(remainingDeleteElementIdsSet)) {
      if(typeof id === "number") {
        sceneF.deleteDeepRecord(id);
      }
    }
  }

  return json;
}

const migration = new Migration();
export default migration;
