import { RuleEvent } from "../../rules/index.js";
// import { RuleAction } from "../../rules/index.js";
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
