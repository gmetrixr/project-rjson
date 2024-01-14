import { FileType } from "../../files/index.js";
import { ElementProperty } from "../../../recordTypes/Element.js";
import { RuleAction } from "../../rules/index.js";
import { RuleEvent } from "../../rules/index.js";
import { BasicElement, ElementType,  IElementDefinition } from "../ElementDefinition.js";

export const Gif: IElementDefinition = {
  element_type: ElementType.gif,
  elementDefaultName: "GIF",
  properties: [
    ...BasicElement.properties,
    ElementProperty.source,
    ElementProperty.opacity,
    ElementProperty.autoplay,
    ElementProperty.hidden,
    ElementProperty.locked,
    ElementProperty.hover_animation,
    ElementProperty.placer_3d,
    ElementProperty.wh,
    ElementProperty.scale,
    ElementProperty.animation,
    ElementProperty.billboarding,
    ElementProperty.use_proximity_optimization,
  ],
  defaultOverrides: {
    [ElementProperty.source]: {
      file_urls: {
        o: "https://s.vrgmetri.com/gb-web/r3f-ui/assets/gif/gmetri_logo.gif",
        t: "https://s.vrgmetri.com/gb-web/r3f-ui/assets/gif/gmetri_logo.gif"
      },
      name: "gmetri_logo.gif",
      type: FileType.GIF
    },
    [ElementProperty.autoplay]: true
  },
  events: [
    ...BasicElement.events,
    RuleEvent.on_press,
    RuleEvent.on_release
  ],
  actions: [
    ...BasicElement.actions,
    RuleAction.play_resume,
    RuleAction.pause
  ]
}
