import { RuleAction } from "../../rules/RuleAction.js";
import { RuleEvent } from "../../rules/RuleEvent.js";
import { IVariableDefinition, VariableType } from "../VariableTypes.js";

export const VariableBoolean: IVariableDefinition = {
  variable_type: VariableType.boolean,
  varDefaultName: "New Boolean Variable",
  varDefaultValue: false,
  events: [
    RuleEvent.on_var_change,
    RuleEvent.on_set_true,
    RuleEvent.on_set_false
  ],
  actions: [
    RuleAction.var_reset,
    RuleAction.set_true,
    RuleAction.set_false,
    RuleAction.set_to_input
  ],
}
