import { RuleEvent } from "../../rules";
// import { RuleAction } from "../../rules";
import { ISpecialDefinition, SpecialType } from "../SpecialTypes";

export const SpecialCurrentTimee: ISpecialDefinition = {
  special_type: SpecialType.current_time,
  events: [
    RuleEvent.on_set_gt,
    RuleEvent.on_set_lt,
  ],
  actions: [
  ],
}
