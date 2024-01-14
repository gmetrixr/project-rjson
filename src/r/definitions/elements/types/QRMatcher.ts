import { ElementProperty } from "../../../recordTypes/Element.js";
import { RuleAction } from "../../rules/index.js";
import { RuleEvent } from "../../rules/index.js";
import { BasicElement, ElementType,  IElementDefinition } from "../ElementDefinition.js";

export const QRMatcher: IElementDefinition = {
  element_type: ElementType.qrcode_matcher,
  elementDefaultName: "QR Matcher",
  properties: [
    ...BasicElement.properties,
    ElementProperty.qr_match_strings
  ],
  defaultOverrides: {},
  events: [ RuleEvent.on_match, RuleEvent.on_nomatch ],
  actions: [
    RuleAction.scan
  ]
}
