import { FileType } from "../../files";
import { ElementProperty } from "../../../recordTypes/Element";
import { RuleAction } from "../../rules";
import { BasicElement, ElementType,  IElementDefinition } from "../ElementDefinition";

export const AR: IElementDefinition = {
  element_type: ElementType.ar,
  elementDefaultName: "AR",
  properties: [
    ...BasicElement.properties,
    ElementProperty.source,
  ],
  defaultOverrides: {
    [ElementProperty.source]: {
      file_urls: {
        o: "https://s.vrgmetri.com/gb-web/r3f-ui/assets/glb/gmetri_logo.glb",
        t: "https://s.vrgmetri.com/gb-web/r3f-ui/assets/glb/gmetri_logo_glb_thumbnail.png"
      },
      name: "gmetri_logo.glb",
      type: FileType.THREED
    }
  },
  events: [],
  actions: [
    RuleAction.show
  ]
}
