import { ElementProperty } from "../../../recordTypes/Element.js";
import { RuleAction } from "../../rules/index.js";
import { BasicElement, ElementType,  IElementDefinition } from "../ElementDefinition.js";

export const WayFinder: IElementDefinition = {
  element_type: ElementType.wayfinder,
  elementDefaultName: "Wayfinder",
  properties: [
    ...BasicElement.properties,
    ElementProperty.text,
    ElementProperty.color,
    ElementProperty.wayfinder_size
    ],
  defaultOverrides: { 
    [ElementProperty.color]: "#3FBF7F"
  },
  events: [ ],
  actions: [ RuleAction.point_to, RuleAction.reset ]
}