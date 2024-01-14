import { RuleEvent } from "../../rules/index.js";
import { RuleAction } from "../../rules/index.js";
import { ISpecialDefinition, SpecialType } from "../SpecialTypes.js";

export const SpecialViewer: ISpecialDefinition = {
  special_type: SpecialType.viewer,
  events: [
    RuleEvent.on_enter,
    RuleEvent.on_leave,
  ],
  actions: [
    RuleAction.teleport,
    RuleAction.change_scene,
    RuleAction.point_to,
    RuleAction.do_nothing
  ],
}
