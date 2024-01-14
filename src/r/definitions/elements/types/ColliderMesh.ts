import { FileType } from "../../files/index.js";
import { ElementProperty } from "../../../recordTypes/Element.js";
import { RuleAction, RuleEvent } from "../../rules/index.js";
import { BasicElement, ElementType, IElementDefinition } from "../ElementDefinition.js";

export const ColliderMesh: IElementDefinition = {
  element_type: ElementType.collider_mesh,
  elementDefaultName: "Collider Mesh",
  properties: [
    ...BasicElement.properties,
    ElementProperty.source,
    ElementProperty.visible,
    ElementProperty.mouse_jump,
    ElementProperty.hidden,
    ElementProperty.wireframe,
    ElementProperty.locked,
    ElementProperty.placer_3d,
    ElementProperty.scale,
    ElementProperty.object3d_animations,
    ElementProperty.apply_env_map,
    ElementProperty.pivot_point,
    ElementProperty.preload,
    ElementProperty.env_map_intensity,
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
    [ElementProperty.billboarding]: null,
    [ElementProperty.opacity]: 0,
  },
  events: [],
  actions: []
}