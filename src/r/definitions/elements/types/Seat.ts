import { ElementProperty } from "../../../recordTypes/Element";
import { BasicElement, ElementType,  IElementDefinition } from "../ElementDefinition";

export const Seat: IElementDefinition = {
  element_type: ElementType.seat,
  elementDefaultName: "Cube",
  properties: [
    ...BasicElement.properties,
    ElementProperty.opacity,
    ElementProperty.color,
    ElementProperty.hidden,
    ElementProperty.locked,
    ElementProperty.placer_3d,
  ],
  defaultOverrides: {},
  events: [],
  actions: []
}
