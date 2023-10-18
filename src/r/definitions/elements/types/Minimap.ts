import { ElementProperty } from "../../../recordTypes/Element";
import { BasicElement, ElementType, IElementDefinition } from "../ElementDefinition";

export const Minimap: IElementDefinition = {
  element_type: ElementType.minimap,
  elementDefaultName: "Minimap",
  properties: [
    ...BasicElement.properties,
    ElementProperty.hidden,
    ElementProperty.locked,
    ElementProperty.placer_3d,
    ElementProperty.scale,
    ElementProperty.minimap_alignment,
    ElementProperty.minimap_margin,
    ElementProperty.color,
  ],
  defaultOverrides: {
    placer_3d: [0, 0, 0, 90, 0, 0, 1, 1, 1],
    scale: 1
  },
  substituteProperties: [],
  substituteDefaultOverrides: {},
  events: [],
  actions: [
    ...BasicElement.actions
  ]
}
