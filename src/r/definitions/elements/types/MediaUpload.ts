import { ElementProperty } from "../../../recordTypes/Element";
import { RuleAction } from "../../rules";
import { RuleEvent } from "../../rules";
import { BasicElement, ElementType,  IElementDefinition } from "../ElementDefinition";

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
