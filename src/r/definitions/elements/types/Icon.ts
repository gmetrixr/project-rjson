import { ElementProperty } from "../../../recordTypes/Element.js";
import { RuleEvent } from "../../rules/index.js";
import { BasicElement, ElementType,  IElementDefinition } from "../ElementDefinition.js";

export const Icon: IElementDefinition = {
  element_type: ElementType.icon,
  elementDefaultName: "Emoji",
  properties: [
    ...BasicElement.properties,
    ElementProperty.icon_type,
    ElementProperty.icon_family,
    ElementProperty.icon_name,
    ElementProperty.icon_id,
    ElementProperty.opacity,
    ElementProperty.hidden,
    ElementProperty.locked,
    ElementProperty.hover_animation,
    ElementProperty.placer_3d,
    ElementProperty.wh,
    ElementProperty.scale,
    ElementProperty.animation,
    ElementProperty.billboarding,
    ElementProperty.use_proximity_optimization,
  ],
  defaultOverrides: {
    [ElementProperty.icon_name]: "blush",
    [ElementProperty.icon_id]: "1f60a"
  },
  events: [
    ...BasicElement.events,
    RuleEvent.on_press,
    RuleEvent.on_release
  ],
  actions: [ ...BasicElement.actions ]
}
