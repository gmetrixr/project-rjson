import { ElementProperty } from "../../../recordTypes/Element";
import { BasicElement, ElementType, IElementDefinition } from "../ElementDefinition";

export const Screenshare: IElementDefinition = {
  element_type: ElementType.screenshare,
  elementDefaultName: "Screenshare",
  properties: [
    ...BasicElement.properties,
    ElementProperty.opacity,
    ElementProperty.hidden,
    ElementProperty.locked,
    ElementProperty.hover_animation,
    ElementProperty.placer_3d,
    ElementProperty.wh,
    ElementProperty.scale,
    ElementProperty.billboarding,
    ElementProperty.use_proximity_optimization,
  ],
  defaultOverrides: {
    [ElementProperty.opacity]: 1,
  },
  events: [],
  actions: []
}
