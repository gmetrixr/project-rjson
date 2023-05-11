import { ElementProperty } from "../../../recordTypes/Element";
import { BasicElement, ElementType, IElementDefinition } from "../ElementDefinition";

export const Zone: IElementDefinition = {
  element_type: ElementType.zone,
  elementDefaultName: "Zone",
  properties: [
    ...BasicElement.properties,
    ElementProperty.hidden,
    ElementProperty.locked,
    ElementProperty.opacity,
    ElementProperty.color,
    ElementProperty.scale,
    ElementProperty.placer_3d,
    ElementProperty.radius,
    ElementProperty.height,
    ElementProperty.use_proximity_optimization,
  ],
  defaultOverrides: {
    // So that the element can be placed on top of the floor in an environment
    [ElementProperty.placer_3d]: [0, 0, 0, 0, 0, 0, 1, 1, 1],
    [ElementProperty.height]: 0.5,
    [ElementProperty.radius]: 1,
    [ElementProperty.color]: "#7ED321",
  },
  events: [],
  actions: [
    ...BasicElement.actions,
  ]
}