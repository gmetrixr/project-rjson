import { ItemProperty } from "../../../recordTypes/Item.js";
import { RuleAction } from "../../rules/index.js";
import { RuleEvent } from "../../rules/index.js";
import { BasicElement, ElementType,  IElementDefinition } from "../ElementDefinition.js";

//TODO: Write migration to move phrase into items
// export interface Phrase {
//   phrase: string,
//   aliases: string[],
//   phrase_id: number
// }

export const Speech: IElementDefinition = {
  element_type: ElementType.speech,
  elementDefaultName: "Speech",
  properties: [ ...BasicElement.properties ],
  defaultOverrides: {},
  events: [ RuleEvent.on_phrase_match, RuleEvent.on_phrase_nomatch ],
  actions: [ RuleAction.listen ]
}
