import { ElementProperty } from "../../../recordTypes/Element";
import { IElementDefinition, ElementType, BasicElement } from "../ElementDefinition";
import { RuleEvent } from "../../rules/RuleEvent";
import { RuleAction } from "../../rules/RuleAction";

export const Hotspot: IElementDefinition = {
  element_type: ElementType.hotspot,
  elementDefaultName: "Hotspot",
  properties: [
    ...BasicElement.properties,
    ElementProperty.hidden,
    ElementProperty.locked,
    ElementProperty.icon_name,
    ElementProperty.heading,
    ElementProperty.description,
    ElementProperty.always_open,
    ElementProperty.source,
    ElementProperty.placer_3d,
    ElementProperty.scale,
    ElementProperty.opacity,
    ElementProperty.target_scene_id,
    ElementProperty.variant,
    ElementProperty.color,
    ElementProperty.billboarding,
    ElementProperty.use_proximity_optimization,
  ],
  defaultOverrides: {
    [ElementProperty.color]: "#0083EE",
    [ElementProperty.opacity]: 0.9,
    [ElementProperty.always_open]: false
  },
  events: [
    RuleEvent.on_click
  ],
  actions: [
    RuleAction.show,
    RuleAction.hide,
    RuleAction.toggle_showhide
  ]
}
