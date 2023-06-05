import { RuleEvent } from "../../rules";
import { RuleAction } from "../../rules";
import { ISpecialDefinition, SpecialType } from "../SpecialTypes";

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
