import { ElementProperty } from "../../../recordTypes/Element.js";
import { RuleEvent } from "../../rules/index.js";
import { BasicElement, ElementType,  IElementDefinition } from "../ElementDefinition.js";

export const Polygon: IElementDefinition = {
  element_type: ElementType.polygon,
  elementDefaultName: "Polygon",
  properties: [
    ...BasicElement.properties,
    ElementProperty.opacity,
    ElementProperty.color,
    ElementProperty.sides,
    ElementProperty.locked,
    ElementProperty.hidden,
    ElementProperty.wireframe,
    ElementProperty.hover_animation,
    ElementProperty.pivot_point,
    ElementProperty.placer_3d,
    ElementProperty.scale,
    ElementProperty.animation,
    ElementProperty.billboarding,
    ElementProperty.use_proximity_optimization,
  ],
  defaultOverrides: {
    [ElementProperty.color]: "#FFC1A3"
  },
  events: [
    ...BasicElement.events,
    RuleEvent.on_press,
    RuleEvent.on_release,
  ],
  actions: [...BasicElement.actions ]
}
