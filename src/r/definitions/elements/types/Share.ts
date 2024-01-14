import { ElementProperty } from "../../../recordTypes/Element.js";
import { ItemProperty } from "../../../recordTypes/Item.js";
import { RuleAction } from "../../rules/index.js";
import { RuleEvent } from "../../rules/index.js";
import { BasicElement, ElementType,  IElementDefinition } from "../ElementDefinition.js";

export const Share: IElementDefinition = {
  element_type: ElementType.share,
  elementDefaultName: "Share",
  properties: [
    ...BasicElement.properties,
    ElementProperty.share_attributes
  ],
  defaultOverrides: {},
  itemProperties: [],
  itemDefaultOverrides: {},
  events: [ RuleEvent.on_close ],
  actions: [ RuleAction.show ]
}
