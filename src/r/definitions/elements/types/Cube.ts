import { ElementProperty } from "../../../recordTypes/Element.js";
import { RuleEvent } from "../../rules/index.js";
import { BasicElement, ElementType,  IElementDefinition } from "../ElementDefinition.js";

export const Cube: IElementDefinition = {
  element_type: ElementType.cube,
  elementDefaultName: "Cube",
  properties: [
    ...BasicElement.properties,
    ElementProperty.opacity,
    ElementProperty.color,
    ElementProperty.hidden,
    ElementProperty.locked,
    ElementProperty.wireframe,
    ElementProperty.hover_animation,
    ElementProperty.pivot_point,
    ElementProperty.placer_3d,
    ElementProperty.whd,
    ElementProperty.scale,
    ElementProperty.animation,
    ElementProperty.use_proximity_optimization,
  ],
  defaultOverrides: {
    [ElementProperty.color]: "#9FFF8A"
  },
  events: [
    ...BasicElement.events,
    RuleEvent.on_press,
    RuleEvent.on_release,
  ],
  actions: [...BasicElement.actions]
}
