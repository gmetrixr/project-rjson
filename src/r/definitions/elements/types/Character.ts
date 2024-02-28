import { FileType } from "../../files/index.js";
import { ElementProperty } from "../../../recordTypes/Element.js";
import { RuleAction, RuleEvent } from "../../rules/index.js";
import { BasicElement, ElementType, IElementDefinition } from "../ElementDefinition.js";

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
    ElementProperty.env_map_intensity,
    ElementProperty.apply_env_map,
    ElementProperty.character_chatbot_initial_prompt,
  ],
  defaultOverrides: {
    [ElementProperty.source]: {
      file_urls: {
        o: "https://s.vrgmetri.com/gb-web/z5-edge/6DOF/avatars/2023-01-06-avatars/glb/rpm_avatar_default_1.glb",
        glb: "https://s.vrgmetri.com/gb-web/z5-edge/6DOF/avatars/2023-01-06-avatars/glb/rpm_avatar_default_1.glb",
      },
      metadata: {
        from_rpm: true,
      },
      name: "gmetri_character.glb",
      type: FileType.THREED
    },
    [ElementProperty.billboarding]: null,
    [ElementProperty.scale]: 0.9
  },
  events: [
    ...BasicElement.events,
    RuleEvent.on_finish_speaking,
    RuleEvent.on_finish_ai_response,
  ],
  actions: [
    ...BasicElement.actions,
    RuleAction.wave,
    RuleAction.clap,
    RuleAction.talk,
    RuleAction.speak
  ],
}