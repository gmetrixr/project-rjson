import { RuleEvent } from "../../rules/RuleEvent.js";
// import { RuleAction } from "../../rules/RuleAction.js";
import { ISpecialDefinition, SpecialType } from "../SpecialTypes.js";

export const SpecialCurrentTimee: ISpecialDefinition = {
  special_type: SpecialType.current_time,
  events: [
    RuleEvent.on_set_gt,
    RuleEvent.on_set_lt,
  ],
  actions: [
  ],
}
