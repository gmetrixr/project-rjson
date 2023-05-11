import { ElementProperty } from "../../../recordTypes/Element";
import { RuleEvent } from "../../rules";
import { BasicElement, ElementType,  IElementDefinition } from "../ElementDefinition";

export const Sphere: IElementDefinition = {
  element_type: ElementType.sphere,
  elementDefaultName: "Sphere",
  properties: [
    ...BasicElement.properties,
    ElementProperty.opacity,
    ElementProperty.color,
    ElementProperty.wireframe,
    ElementProperty.hover_animation,
    ElementProperty.locked,
    ElementProperty.hidden,
    ElementProperty.pivot_point,
    ElementProperty.placer_3d,
    ElementProperty.radius,
    ElementProperty.arc,
    ElementProperty.scale,
    ElementProperty.animation,
    ElementProperty.use_proximity_optimization,
  ],
  defaultOverrides: { 
    [ElementProperty.color]: "#9AF4FF"
  },
  events: [
    ...BasicElement.events,
    RuleEvent.on_press, 
    RuleEvent.on_release
  ],
  actions: [...BasicElement.actions ]
}