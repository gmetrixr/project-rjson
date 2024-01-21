import { ElementProperty } from "../../../recordTypes/Element.js";
import { RuleAction } from "../../rules/index.js";
import { ElementType,  IElementDefinition } from "../ElementDefinition.js";

export const Group: IElementDefinition = {
  element_type: ElementType.group,
  elementDefaultName: "Group",
  properties: [
    ElementProperty.element_type,
    ElementProperty.hidden,
    // ElementProperty.locked,
    // ElementProperty.opacity,
  ],
  defaultOverrides: {},
  events: [],
  actions: [
    RuleAction.show,
    RuleAction.hide,
    RuleAction.toggle_showhide,
  ]
}
