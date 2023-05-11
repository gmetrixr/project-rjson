import { FileType } from "../../files";
import { ElementProperty } from "../../../recordTypes/Element";
import { RuleAction } from "../../rules";
import { RuleEvent } from "../../rules";
import { BasicElement, ElementType,  IElementDefinition } from "../ElementDefinition";

export const PanoVideo: IElementDefinition = {
  element_type: ElementType.pano_video,
  elementDefaultName: "Pano Video",
  properties: [
    ...BasicElement.properties,
    ElementProperty.source,
    ElementProperty.volume,
    ElementProperty.opacity,
    ElementProperty.pano_pitch_correction,
    ElementProperty.pano_yaw_correction,
    ElementProperty.autoplay,
    ElementProperty.loop,
    ElementProperty.muted,
    ElementProperty.hidden,
    ElementProperty.locked,
    ElementProperty.stereo,
    ElementProperty.pano_radius,
    ElementProperty.start_time,

    ElementProperty.placer_3d
  ],
  defaultOverrides: {
    [ElementProperty.source]: {
      file_urls: {
        o: "https://s.vrgmetri.com/gb-web/r3f-ui/assets/panoVideo/videopano_default.mp4",
        t: "https://s.vrgmetri.com/image/w_400,q_90/gb-web/r3f-ui/assets/panoVideo/videopano_default_thumbnail.png",
      },
      name: "videopano_default.mp4",
      type: FileType.VIDEO
    },
    [ElementProperty.muted]: false,
  },
  events: [ RuleEvent.on_end ],
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
