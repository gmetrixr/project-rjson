import { RuleAction } from "../../rules/RuleAction";
import { RuleEvent } from "../../rules/RuleEvent";
import { IVariableDefinition, VariableType } from "../VariableTypes";

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
