import { FileType } from "../../files";
import { ElementProperty } from "../../../recordTypes/Element";
import { BasicElement, ElementType,  IElementDefinition } from "../ElementDefinition";

export const PanoImage: IElementDefinition = {
  element_type: ElementType.pano_image,
  elementDefaultName: "Pano Image",
  properties: [
    ...BasicElement.properties,
    ElementProperty.source,
    ElementProperty.opacity,
    ElementProperty.pano_pitch_correction,
    ElementProperty.pano_yaw_correction,
    ElementProperty.hidden,
    ElementProperty.locked,
    ElementProperty.stereo,
    ElementProperty.pano_radius,
    ElementProperty.placer_3d
  ],
  defaultOverrides: {
    [ElementProperty.source]: {
      file_urls: {
        o: "https://s.vrgmetri.com/gb-web/r3f-ui/assets/pano/0_grid_02_white.jpg",
        t: "https://s.vrgmetri.com/image/w_400,q_90/gb-web/r3f-ui/assets/pano/0_grid_02_white.jpg",
      },
      name: "grid_02_white.jpg",
      type: FileType.IMAGE
    },
    [ElementProperty.pano_radius]: 900,
    [ElementProperty.opacity]: 1
  },
  events: [ ],
  actions: [ ...BasicElement.actions ]
}
