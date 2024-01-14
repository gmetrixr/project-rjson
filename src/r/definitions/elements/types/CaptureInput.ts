import { ElementProperty } from "../../../recordTypes/Element.js";
import { RuleAction } from "../../rules/index.js";
import { RuleEvent } from "../../rules/index.js";
import { BasicElement, ElementType,  IElementDefinition } from "../ElementDefinition.js";

export const CaptureInput: IElementDefinition = {
  element_type: ElementType.capture_input,
  elementDefaultName: "Capture Input",
  properties: [
    ...BasicElement.properties,
    ElementProperty.hidden,
    ElementProperty.capture_input_mode,
    ElementProperty.capture_input_dropdown_options,
    ElementProperty.min,
    ElementProperty.max,
    ElementProperty.regex,
    ElementProperty.regex_error_msg,
    ElementProperty.placeholder_text
  ],
  defaultOverrides: {
    [ElementProperty.hidden]: true
  },
  events: [RuleEvent.on_capture_input, RuleEvent.on_close],
  actions: [RuleAction.show]
}
