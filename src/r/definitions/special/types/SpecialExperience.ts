import { RuleAction } from "../../rules/RuleAction.js";
import { ISpecialDefinition, SpecialType } from "../SpecialTypes.js";

export const SpecialExperience: ISpecialDefinition = {
  special_type: SpecialType.experience,
  events: [
  ],
  actions: [
    RuleAction.open_url,
    RuleAction.open_deployment,
    RuleAction.show_notification,
    RuleAction.copy_to_clipboard,
    RuleAction.end_experience,
    RuleAction.take_screenshot,
    // SCORM Related: These events are used to send events to the container iframe, when the experience itself
    // gets used like a scorm package
    RuleAction.set_scorm_failed,
    RuleAction.set_scorm_passed,
    RuleAction.set_scorm_completed,
    RuleAction.set_scorm_score_min,
    RuleAction.set_scorm_score_max,
    RuleAction.set_scorm_score,
    RuleAction.replace_screen_reader_text,
    RuleAction.change_view_mode,
  ],
}
