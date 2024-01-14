import { ElementProperty } from "../../../recordTypes/Element.js";
import { BasicElement, ElementType,  IElementDefinition } from "../ElementDefinition.js";
import { FileType } from "../../files/index.js";

export const Environment: IElementDefinition = {
  element_type: ElementType.environment,
  elementDefaultName: "Environment",
  properties: [
    ...BasicElement.properties,
    ElementProperty.source,
    ElementProperty.hidden,
    ElementProperty.placer_3d,
    ElementProperty.scale,
  ],
  defaultOverrides: {
    [ElementProperty.source]: {
      id: -1,
      name: "Event 1",
      file_urls: {
        o: "https://s.vrgmetri.com/gb-web/z5-edge/6DOF/environments/Event/eventModel_v10.glb",
        t: "https://s.vrgmetri.com/image/w_260,h_120/gb-web/z5-edge/6DOF/environments/Event/event_preview.png",
        glb: "https://s.vrgmetri.com/gb-web/z5-edge/6DOF/environments/Event/eventModel_v10.glb"
      },
      type: FileType.THREED
    },
    [ElementProperty.scale]: 0.5,
    [ElementProperty.placer_3d]: [0, -1.6, 0, 0, 0, 0, 1, 1, 1],
    // this is a proxy so that the element can't be modified from the editor
    [ElementProperty.locked]: true
  },
  events: [],
  actions: []
}