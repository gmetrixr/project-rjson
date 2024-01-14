import { FileType } from "../../files/index.js";
import { ElementProperty } from "../../../recordTypes/Element.js";
import { RuleAction, RuleEvent } from "../../rules/index.js";
import { BasicElement, ElementType, IElementDefinition } from "../ElementDefinition.js";

export const Object3d: IElementDefinition = {
  element_type: ElementType.object_3d,
  elementDefaultName: "3D Object",
  properties: [
    ...BasicElement.properties,
    ElementProperty.source,
    ElementProperty.hidden,
    ElementProperty.wireframe,
    ElementProperty.auto_rotate,
    ElementProperty.auto_animation,
    ElementProperty.hover_animation,
    ElementProperty.locked,
    ElementProperty.placer_3d,
    ElementProperty.scale,
    ElementProperty.object3d_animations,
    ElementProperty.apply_env_map,
    ElementProperty.pivot_point,
    ElementProperty.preload,
    ElementProperty.env_map_intensity,
    ElementProperty.use_proximity_optimization,
  ],
  defaultOverrides: {
    [ElementProperty.source]: {
      file_urls: {
        o: "https://s.vrgmetri.com/gb-web/r3f-ui/assets/glb/gmetri_logo.glb",
        glb: "https://s.vrgmetri.com/gb-web/r3f-ui/assets/glb/gmetri_logo.glb",
        t: "https://s.vrgmetri.com/gb-web/r3f-ui/assets/glb/gmetri_logo_glb_thumbnail.png"
       },
      name: "gmetri_logo.glb",
      type: FileType.THREED
    },
    [ElementProperty.billboarding]: null
  },
  events: [
    ...BasicElement.events,
    RuleEvent.on_press,
    RuleEvent.on_release,
  ],
  actions: [
    ...BasicElement.actions,
    RuleAction.gltf_preset_start,
    RuleAction.gltf_preset_stop,
    RuleAction.gltf_preset_start_all,
    RuleAction.gltf_preset_stop_all
  ]
}