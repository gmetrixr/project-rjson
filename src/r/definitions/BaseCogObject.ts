import { RuleAction } from "./rules/RuleAction.js";
import { RuleEvent } from "./rules/RuleEvent.js";

/** 
 * Interface for RuleElement Type Definition (Objects that can be rule in defining Rules) 
 * There are three types of RuleElements - 
 * SpecialType
 * VariableType
 * ElementType
 */
export interface ICogObjectDefinition {
  events: Array<RuleEvent>;
  actions: Array<RuleAction>;
}
