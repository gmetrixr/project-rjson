import { ElementProperty } from "../../../recordTypes/Element";
import { RuleAction } from "../../rules";
import { RuleEvent } from "../../rules";
import { BasicElement, ElementType,  IElementDefinition } from "../ElementDefinition";

export const AudioSSML: IElementDefinition = {
  element_type: ElementType.audio_ssml,
  elementDefaultName: "Audio TTS",
  properties: [
    ...BasicElement.properties,
    ElementProperty.audio_type,
    ElementProperty.source,
    ElementProperty.volume,
    ElementProperty.muted,
    ElementProperty.loop,
    ElementProperty.ssml,
    ElementProperty.ssml_speed,
    ElementProperty.ssml_lang,
    ElementProperty.ssml_voice,
    ElementProperty.ssml_pitch
  ],
  defaultOverrides: {
    [ElementProperty.loop]: false,
    [ElementProperty.muted]: false,
    [ElementProperty.audio_type]: "ssml",
  },
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
