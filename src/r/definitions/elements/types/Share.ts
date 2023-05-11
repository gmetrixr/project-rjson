import { ElementProperty } from "../../../recordTypes/Element";
import { ItemProperty } from "../../../recordTypes/Item";
import { RuleAction } from "../../rules";
import { RuleEvent } from "../../rules";
import { BasicElement, ElementType,  IElementDefinition } from "../ElementDefinition";

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
