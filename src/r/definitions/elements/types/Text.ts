import { ElementProperty } from "../../../recordTypes/Element";
import { SubstituteProperty } from "../../../recordTypes/Substitute";
import { RuleEvent } from "../../rules";
import { BasicElement, ElementType,  IElementDefinition } from "../ElementDefinition";

export const Text: IElementDefinition = {
  element_type: ElementType.text,
  elementDefaultName: "Text",
  properties: [
    ...BasicElement.properties,
    ElementProperty.text,
    ElementProperty.opacity,
    ElementProperty.font_color,
    ElementProperty.font_size,
    ElementProperty.font_bold,
    ElementProperty.hidden,
    ElementProperty.locked,
    ElementProperty.hover_animation,
    ElementProperty.placer_3d,
    ElementProperty.wh,
    ElementProperty.scale,
    ElementProperty.animation,
    ElementProperty.font_family,
    ElementProperty.font_weight,
    ElementProperty.billboarding,

    // background
    ElementProperty.border_radius,
    ElementProperty.border_width,
    ElementProperty.border_color,
    ElementProperty.border_opacity,
    ElementProperty.background_color,
    ElementProperty.background_opacity,
    ElementProperty.padding,
    ElementProperty.vertical_alignment,
    ElementProperty.horizontal_alignment,
    ElementProperty.text_version,
    ElementProperty.use_proximity_optimization,
    ElementProperty.enable_substitutes,
    ElementProperty.linked_substitute_variable,
  ],
  defaultOverrides: {
    [ElementProperty.text]: "welcome to the metaverse",
    [ElementProperty.wh]: [6.5, 3],
    [ElementProperty.font_color]: "#FFFFFF",
    [ElementProperty.font_size]: 0.6,
  },
  substituteProperties: [SubstituteProperty.substitute_variable, SubstituteProperty.substitute_text],
  substituteDefaultOverrides: {},
  events: [
    ...BasicElement.events,
    RuleEvent.on_press, 
    RuleEvent.on_release
  ],
  actions: [...BasicElement.actions ]
}
