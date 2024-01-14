import { ElementProperty } from "../../../recordTypes/Element.js";
import { RuleAction } from "../../rules/index.js";
import { RuleEvent } from "../../rules/index.js";
import { BasicElement, ElementType,  IElementDefinition } from "../ElementDefinition.js";

export const Timer: IElementDefinition = {
  element_type: ElementType.timer,
  elementDefaultName: "Timer",
  properties: [
    ...BasicElement.properties,
    ElementProperty.timer_mode_countdown,
    ElementProperty.timer_duration,
    ElementProperty.opacity,
    ElementProperty.font_color,
    ElementProperty.autoplay,
    ElementProperty.hidden,
    ElementProperty.locked,
    ElementProperty.placer_3d,
    ElementProperty.scale,
    ElementProperty.wh,
    ElementProperty.animation,
    ElementProperty.billboarding,
  ],
  defaultOverrides: {
    [ElementProperty.wh]: [6.5, 4],
    [ElementProperty.autoplay]: true,
  },
  events: [
    RuleEvent.on_end,
    RuleEvent.on_timermatch
  ],
  actions: [
    ...BasicElement.actions, 
    RuleAction.start,
    RuleAction.pause,
    RuleAction.reset,
    RuleAction.timer_seek,
    RuleAction.seek_to_end
  ]
}
