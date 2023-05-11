import { ElementProperty } from "../../../recordTypes/Element";
import { RuleAction } from "../../rules";
import { RuleEvent } from "../../rules";
import { BasicElement, ElementType,  IElementDefinition } from "../ElementDefinition";

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
