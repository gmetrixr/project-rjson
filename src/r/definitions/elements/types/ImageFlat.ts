import { FileType } from "../../files/index.js";
import { ElementProperty } from "../../../recordTypes/Element.js";
import { RuleEvent } from "../../rules/index.js";
import { BasicElement, ElementType,  IElementDefinition } from "../ElementDefinition.js";
import { SubstituteProperty } from "../../../recordTypes/Substitute.js";

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
    ElementProperty.enable_substitutes,
    ElementProperty.linked_substitute_variable,
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
  substituteProperties: [SubstituteProperty.substitute_variable, SubstituteProperty.substitute_source],
  substituteDefaultOverrides: {},
  events: [
    ...BasicElement.events,
    RuleEvent.on_press,
    RuleEvent.on_release
  ],
  actions: [
    ...BasicElement.actions
  ]
}
