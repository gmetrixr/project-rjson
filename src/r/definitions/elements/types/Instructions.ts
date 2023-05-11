import { ElementProperty } from "../../../recordTypes/Element";
import { ItemProperty } from "../../../recordTypes/Item";
import { RuleEvent, RuleAction } from "../../rules";
import { BasicElement, ElementType,  IElementDefinition } from "../ElementDefinition";

export const Instruction: IElementDefinition = {
  element_type: ElementType.instruction,
  elementDefaultName: "Story",
  properties: [
    ...BasicElement.properties,
    ElementProperty.autoplay,
  ],
  defaultOverrides: {},
  itemProperties: [
    ItemProperty.item_text,
    ItemProperty.item_source,
  ],
  itemDefaultOverrides: {},
  events: [
    RuleEvent.on_end
  ],
  actions: [ RuleAction.show ]
}
