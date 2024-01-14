import { RuleAction } from "../../rules/index.js";
import { RuleEvent } from "../../rules/index.js";
import { BasicElement, ElementType,  IElementDefinition } from "../ElementDefinition.js";

export const Score: IElementDefinition = {
  element_type: ElementType.score,
  elementDefaultName: "Score",
  properties: [ ...BasicElement.properties ],
  defaultOverrides: {},
  events: [],
  actions: [ RuleAction.award_score ]
}
