import { RuleAction } from "../../rules/RuleAction.js";
import { RuleEvent } from "../../rules/RuleEvent.js";
import { IVariableDefinition, VariableType } from "../VariableTypes.js";

export const VariableNumber: IVariableDefinition = {
  variable_type: VariableType.number,
  varDefaultName: "New Number Variable",
  varDefaultValue: 0,
  events: [
    RuleEvent.on_var_change,
    RuleEvent.on_set_between,
    RuleEvent.on_set_eq,
    RuleEvent.on_set_gt,
    RuleEvent.on_set_gte,
    RuleEvent.on_set_lt,
    RuleEvent.on_set_lte,
    RuleEvent.on_is_in_list,
    RuleEvent.on_is_not_in_list,
  ],
  actions: [
    RuleAction.var_reset,
    RuleAction.set_to_number,
    RuleAction.set_to_formula,
    RuleAction.add_number,
    RuleAction.set_to_input,
    RuleAction.add_input,
  ]
}
