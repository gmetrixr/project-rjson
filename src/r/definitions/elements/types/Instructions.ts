import { ElementProperty } from "../../../recordTypes/Element.js";
import { ItemProperty } from "../../../recordTypes/Item.js";
import { RuleEvent, RuleAction } from "../../rules/index.js";
import { BasicElement, ElementType,  IElementDefinition } from "../ElementDefinition.js";

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
