import { RuleEvent } from "../../rules/RuleEvent.js";
// import { RuleAction } from "../../rules/RuleAction.js";
import { ISpecialDefinition, SpecialType } from "../SpecialTypes.js";

export const SpecialScene: ISpecialDefinition = {
  special_type: SpecialType.scene,
  events: [
    RuleEvent.on_preload,
    RuleEvent.on_load,
  ],
  actions: [
    
  ],
}
