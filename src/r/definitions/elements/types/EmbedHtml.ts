import { ElementProperty } from "../../../recordTypes/Element";
import { RuleAction, RuleEvent } from "../../rules";
import { BasicElement, ElementType, IElementDefinition } from "../ElementDefinition";

export const EmbedHtml: IElementDefinition = {
  element_type: ElementType.embed_html,
  elementDefaultName: "Embed HTML",
  properties: [
    ...BasicElement.properties,
    ElementProperty.embed_mode,
    ElementProperty.background_source,
    ElementProperty.embed_string,
    ElementProperty.target_element_id,
  ],
  defaultOverrides: {},
  events: [ RuleEvent.on_close ],
  actions: [ RuleAction.show, RuleAction.hide ]
}
