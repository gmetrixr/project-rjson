import { FileType } from "../../files";
import { ElementProperty } from "../../../recordTypes/Element";
import { RuleAction, RuleEvent } from "../../rules";
import { BasicElement, ElementType, IElementDefinition } from "../ElementDefinition";

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
    RuleAction.talk
  ],
}