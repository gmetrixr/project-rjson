import { ElementProperty } from "../../../recordTypes/Element.js";
import { RuleEvent } from "../../rules/index.js";
import { BasicElement, ElementType,  IElementDefinition } from "../ElementDefinition.js";

export const Cone: IElementDefinition = {
  element_type: ElementType.cone,
  elementDefaultName: "Cone",
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
    ElementProperty.radius,
    ElementProperty.arc,
    ElementProperty.height,
    ElementProperty.scale,
    ElementProperty.animation,
    ElementProperty.use_proximity_optimization,
  ],
  defaultOverrides: {
    [ElementProperty.color]: "#A895E0"
  },
  events: [
    ...BasicElement.events,
    RuleEvent.on_press,
    RuleEvent.on_release,
  ],
  actions: [...BasicElement.actions]
}