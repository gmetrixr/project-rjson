import { FileType } from "../../files";
import { ElementProperty } from "../../../recordTypes/Element";
import { RuleEvent } from "../../rules";
import { BasicElement, ElementType,  IElementDefinition } from "../ElementDefinition";

export const ImageFlat: IElementDefinition = {
  element_type: ElementType.image_flat,
  elementDefaultName: "Image",
  properties: [
    ...BasicElement.properties,
    ElementProperty.source,
    ElementProperty.opacity,
    ElementProperty.hidden,
    ElementProperty.locked,
    ElementProperty.hover_animation,
    ElementProperty.placer_3d,
    ElementProperty.wh,
    ElementProperty.scale,
    ElementProperty.animation, //"bounce"/"fade"/"rotate"
    ElementProperty.billboarding,
    ElementProperty.use_proximity_optimization,
    ElementProperty.linked_element_id,
  ],
  defaultOverrides: {
    [ElementProperty.source]: {
      file_urls: {
        o: "https://s.vrgmetri.com/gb-web/r3f-ui/assets/image/image_flat_default.png",
        t: "https://s.vrgmetri.com/gb-web/r3f-ui/assets/image/image_flat_default.png"
      },
      name: "image_flat_default.jpg",
      type: FileType.IMAGE
    }
  },
  events: [
    ...BasicElement.events,
    RuleEvent.on_press,
    RuleEvent.on_release
  ],
  actions: [
    ...BasicElement.actions
  ]
}
