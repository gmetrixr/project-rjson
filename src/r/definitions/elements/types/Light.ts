import { ElementProperty } from "../../../recordTypes/Element";
import { BasicElement, ElementType,  IElementDefinition } from "../ElementDefinition";

export const Light: IElementDefinition = {
  element_type: ElementType.light,
  elementDefaultName: "Light",
  properties: [
    ...BasicElement.properties,
    ElementProperty.hidden,
    ElementProperty.locked,
    ElementProperty.light_type,
    ElementProperty.color,
    ElementProperty.intensity,
    ElementProperty.fall_off,
    ElementProperty.placer_3d,
    ElementProperty.target_element_id,
  ],
  defaultOverrides: {},
  itemDefaultOverrides: {},
  events: [],
  actions: [...BasicElement.actions]
}
