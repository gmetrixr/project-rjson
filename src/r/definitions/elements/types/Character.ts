import {FileType} from "../../files";
import {ElementProperty} from "../../../recordTypes/Element";
import {RuleAction} from "../../rules";
import {BasicElement, ElementType, IElementDefinition} from "../ElementDefinition";

export const Character: IElementDefinition = {
  element_type: ElementType.character,
  elementDefaultName: "Character",
  properties: [
    ...BasicElement.properties,
    ElementProperty.source,
    ElementProperty.hidden,
    ElementProperty.locked,
    ElementProperty.placer_3d,
    ElementProperty.scale,
    ElementProperty.pose,
    ElementProperty.use_proximity_optimization,
    ElementProperty.use_ai_brain,
    ElementProperty.character_brain_slug,
    ElementProperty.character_chatbot_trigger_radius,
    ElementProperty.character_chatbot_welcome_dialogue,
    ElementProperty.character_chatbot_welcome_dialogue_repeat,
    ElementProperty.ssml_lang,
    ElementProperty.ssml_voice,
    ElementProperty.ssml_pitch,
    ElementProperty.ssml_speed,
    ElementProperty.billboarding,
  ],
  defaultOverrides: {
    [ElementProperty.source]: {
      file_urls: {
        o: "https://s.vrgmetri.com/gb-web/z5-edge/6DOF/avatars/2023-01-06-avatars/glb/rpm_avatar_default_1.glb",
        glb: "https://s.vrgmetri.com/gb-web/z5-edge/6DOF/avatars/2023-01-06-avatars/glb/rpm_avatar_default_1.glb",
       },
      name: "gmetri_character.glb",
      type: FileType.THREED
    },
    [ElementProperty.billboarding]: null
  },
  events: [
    ...BasicElement.events
  ],
  actions: [
    ...BasicElement.actions,
    RuleAction.wave,
    RuleAction.clap,
    RuleAction.talk,
    RuleAction.speak
  ],
}