import { RuleAction } from "../../rules/RuleAction.js";
import { ISpecialDefinition, SpecialType } from "../SpecialTypes.js";

export const SpecialAllVariables: ISpecialDefinition = {
  special_type: SpecialType.all_variables,
  events: [],
  actions: [
    RuleAction.var_reset,
  ],
}
