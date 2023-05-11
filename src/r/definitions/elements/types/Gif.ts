import { FileType } from "../../files";
import { ElementProperty } from "../../../recordTypes/Element";
import { RuleAction } from "../../rules";
import { RuleEvent } from "../../rules";
import { BasicElement, ElementType,  IElementDefinition } from "../ElementDefinition";

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
