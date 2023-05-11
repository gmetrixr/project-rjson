import { RuleAction } from "../../rules";
import { RuleEvent } from "../../rules";
import { BasicElement, ElementType,  IElementDefinition } from "../ElementDefinition";

export const Score: IElementDefinition = {
  element_type: ElementType.score,
  elementDefaultName: "Score",
  properties: [ ...BasicElement.properties ],
  defaultOverrides: {},
  events: [],
  actions: [ RuleAction.award_score ]
}
