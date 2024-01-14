import { FileType } from "../../files/index.js";
import { ElementProperty } from "../../../recordTypes/Element.js";
import { RuleAction } from "../../rules/index.js";
import { RuleEvent } from "../../rules/index.js";
import { BasicElement, ElementType,  IElementDefinition } from "../ElementDefinition.js";
import { SubstituteProperty } from "../../../recordTypes/Substitute.js";

export const Audio: IElementDefinition = {
  element_type: ElementType.audio,
  elementDefaultName: "Audio",
  properties: [
    ...BasicElement.properties,
    ElementProperty.audio_type,
    ElementProperty.source,
    ElementProperty.volume,
    ElementProperty.muted,
    ElementProperty.loop,
    ElementProperty.use_html5_audio,
    ElementProperty.enable_substitutes,
    ElementProperty.linked_substitute_variable,
  ],
  defaultOverrides: {
    [ElementProperty.source]: {
      file_urls: {
        o: "https://s.vrgmetri.com/gb-web/r3f-ui/assets/audio/audio_default.mp3"
      },
      name: "audio_default.mp3",
      type: FileType.AUDIO
    },
    [ElementProperty.loop]: false,
    [ElementProperty.muted]: false,
    [ElementProperty.audio_type]: "upload",
  },
  substituteProperties: [SubstituteProperty.substitute_variable, SubstituteProperty.substitute_source],
  substituteDefaultOverrides: {},
  events: [
    RuleEvent.on_end,
    RuleEvent.on_duration_match
  ],
  actions: [
    RuleAction.play_resume,
    RuleAction.play_seek,
    RuleAction.pause,
    RuleAction.toggle_play_pause,
    RuleAction.mute,
    RuleAction.unmute,
    RuleAction.volume,
  ]
}
