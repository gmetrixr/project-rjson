import { ItemProperty } from "../../../recordTypes/Item";
import { RuleAction } from "../../rules";
import { RuleEvent } from "../../rules";
import { BasicElement, ElementType,  IElementDefinition } from "../ElementDefinition";

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
