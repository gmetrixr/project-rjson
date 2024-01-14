import { ElementProperty } from "../../../recordTypes/Element.js";
import { RuleAction } from "../../rules/index.js";
import { RuleEvent } from "../../rules/index.js";
import { BasicElement, ElementType,  IElementDefinition } from "../ElementDefinition.js";

export const MediaUpload: IElementDefinition = {
  element_type: ElementType.media_upload,
  elementDefaultName: "Media Upload",
  properties: [
    ...BasicElement.properties,
    ElementProperty.heading,
    ElementProperty.description,
    ElementProperty.upload_methods_allowed,
    ElementProperty.media_upload_var_id,
    ElementProperty.media_upload_file_types,
  ],
  defaultOverrides: {},
  events: [RuleEvent.on_successful_upload, RuleEvent.on_close],
  actions: [ RuleAction.show ]
}
