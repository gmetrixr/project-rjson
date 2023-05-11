import { ElementProperty } from "../../../recordTypes/Element";
import { BasicElement, ElementType,  IElementDefinition } from "../ElementDefinition";

export const ColliderBox: IElementDefinition = {
  element_type: ElementType.collider_volume,
  elementDefaultName: "ColliderVolume",
  properties: [
    ...BasicElement.properties,
    ElementProperty.hidden,
    ElementProperty.locked,
    ElementProperty.volume_type,
    ElementProperty.mouse_jump,
    ElementProperty.placer_3d,
    ElementProperty.whd,
    ElementProperty.scale,
    ElementProperty.radius,
    ElementProperty.arc,
    ElementProperty.height,
    ElementProperty.outer_radius,
    ElementProperty.inner_radius,
    ElementProperty.sides
  ],
  defaultOverrides: {},
  events: [],
  actions: []
}
