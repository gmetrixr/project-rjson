import { ElementProperty } from "../../../recordTypes/Element.js";
import { RuleAction, RuleEvent } from "../../rules/index.js";
import { BasicElement, ElementType, IElementDefinition } from "../ElementDefinition.js";

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
