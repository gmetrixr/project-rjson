import { r, RecordNode, RT } from "../../index.js";
import { RuleAction } from "./RuleAction.js";
import { RuleEvent } from "./RuleEvent.js";

export function isRuleValid(rule: RecordNode<RT.rule>): boolean {
  const ruleF = r.record(rule);
  const whenEvents = ruleF.getRecords(RT.when_event);
  const thenActions = ruleF.getRecords(RT.then_action);
  // wI and tI should never be true
  const wI = whenEvents.findIndex((w: RecordNode<RT.when_event>) => w.props.event === "");
  const tI = thenActions.findIndex((t: RecordNode<RT.then_action>) => t.props.action === "");
  
  if (wI !== -1 || tI !== -1) {
    return false;
  }

  if (whenEvents.length === 0) {
    return false;
  }

  for (const w of whenEvents) {
    switch (w.props.event) {
      case RuleEvent.on_hover:
      case RuleEvent.on_duration_match:
      case RuleEvent.on_timermatch:
      case RuleEvent.on_set_eq:
      case RuleEvent.on_set_gt:
      case RuleEvent.on_set_gte:
      case RuleEvent.on_set_lt:
      case RuleEvent.on_match:
      case RuleEvent.on_set_lte:
      case RuleEvent.on_is_in_list:
      case RuleEvent.on_is_not_in_list: {
        const properties = w.props.we_properties as string[];
        if (properties?.[0] === undefined) {
          return false;
        }
        break;
      }

      case RuleEvent.on_set_between: {
        const properties = w.props.we_properties as string[];
        if (properties?.[0] === undefined || properties?.[1] === undefined) {
          return false;
        }
        break;
      }
    }
  }

  for (const ta of thenActions) {
    switch (ta.props.action) {
      case RuleAction.set_to_string:
      case RuleAction.set_to_number:
      case RuleAction.set_to_formula:
      case RuleAction.load_project:
      case RuleAction.call_api:
      case RuleAction.copy_to_clipboard:
      case RuleAction.play_seek:
      case RuleAction.talk:
      case RuleAction.change_view_mode:
      case RuleAction.change_scene: {
        const properties = ta.props.ta_properties as string[];
        if (properties?.[0] === undefined) {
          return false;
        }
        break;
      }
      case RuleAction.award_score:
      case RuleAction.set_scorm_score:
      case RuleAction.set_scorm_score_max:
      case RuleAction.set_scorm_score_min:
      case RuleAction.volume:
      case RuleAction.timer_seek:
      case RuleAction.point_to: {
        const properties = ta.props.ta_properties as string[];
        if (properties?.[0] === undefined) {
          return false;
        }
        break;
      }
      case RuleAction.gltf_preset_start_all:
      case RuleAction.add_number: {
        const properties = ta.props.ta_properties as string[];
        if (properties?.[0] === undefined) {
          return false;
        }
        break;
      }

      case RuleAction.gltf_preset_start:
      case RuleAction.gltf_preset_stop:
      case RuleAction.open_url: {
        const properties = ta.props.ta_properties as string[];
        if (properties?.[0] === undefined || properties?.[1] === undefined) {
          return false;
        }
        break;
      }
    }
  }

  return true;
}