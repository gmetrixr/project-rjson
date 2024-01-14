import { FileType } from "../../files/index.js";
import { ElementProperty } from "../../../recordTypes/Element.js";
import { RuleAction, RuleEvent } from "../../rules/index.js";
import { BasicElement, ElementType, IElementDefinition } from "../ElementDefinition.js";

export const VideoFlat: IElementDefinition = {
  element_type: ElementType.video_flat,
  elementDefaultName: "Video",
  properties: [
    ...BasicElement.properties,
    ElementProperty.source,
    ElementProperty.opacity,
    ElementProperty.volume,
    ElementProperty.autoplay,
    ElementProperty.hidden,
    ElementProperty.locked,
    ElementProperty.muted,
    ElementProperty.loop,
    ElementProperty.hover_animation,
    ElementProperty.placer_3d,
    ElementProperty.wh,
    ElementProperty.scale,
    ElementProperty.chroma_effect,
    ElementProperty.chroma_color,
    ElementProperty.animation,
    ElementProperty.billboarding,
    ElementProperty.start_time,
    ElementProperty.use_proximity_optimization,
    ElementProperty.linked_element_id,
  ],
  defaultOverrides: {
    [ElementProperty.source]: {
      file_urls: {
        o: "https://s.vrgmetri.com/gb-web/r3f-ui/assets/video/video_default.mp4",
        t: "https://s.vrgmetri.com/gb-web/r3f-ui/assets/video/video_default_thumbnail.png",
      },
      name: "video_default.mp4",
      type: FileType.VIDEO
    },
    [ElementProperty.opacity]: 1,
    [ElementProperty.autoplay]: false,
    [ElementProperty.muted]: false,
  },
  events: [
    ...BasicElement.events,
    RuleEvent.on_press, 
    RuleEvent.on_release, 
    RuleEvent.on_end,
    RuleEvent.on_duration_match
  ],
  actions: [
    ...BasicElement.actions,
    RuleAction.play_resume,
    RuleAction.play_seek,
    RuleAction.pause,
    RuleAction.toggle_play_pause,
    RuleAction.mute,
    RuleAction.unmute,
    RuleAction.volume
  ]
}
