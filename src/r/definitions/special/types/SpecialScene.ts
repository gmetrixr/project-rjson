import { RuleEvent } from "../../rules/RuleEvent";
import { RuleAction } from "../../rules/RuleAction";
import { ISpecialDefinition, SpecialType } from "../SpecialTypes";

export const SpecialScene: ISpecialDefinition = {
  special_type: SpecialType.scene,
  events: [
    RuleEvent.on_preload,
    RuleEvent.on_load,
  ],
  actions: [
    
  ],
}
