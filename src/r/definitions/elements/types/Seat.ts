import { ElementProperty } from "../../../recordTypes/Element";
import { BasicElement, ElementType,  IElementDefinition } from "../ElementDefinition";

export const Seat: IElementDefinition = {
  element_type: ElementType.seat,
  elementDefaultName: "Cube",
  properties: [
    ...BasicElement.properties,
    ElementProperty.opacity,
    ElementProperty.hidden,
    ElementProperty.locked,
    ElementProperty.placer_3d,
  ],
  defaultOverrides: {
    [ElementProperty.placer_3d]: [0, 0, -8, 90, 0, 0, 1, 1, 1],
  },
  events: [],
  actions: []
}
