import { ElementProperty } from "../../../recordTypes/Element.js";
import { RuleAction } from "../../rules/index.js";
import { RuleEvent } from "../../rules/index.js";
import { BasicElement, ElementType,  IElementDefinition } from "../ElementDefinition.js";

export const EmbedScorm: IElementDefinition = {
  element_type: ElementType.embed_scorm,
  elementDefaultName: "SCORM",
  properties: [
    ...BasicElement.properties,
    ElementProperty.source,
    ElementProperty.view_mode,
    ElementProperty.embed_scorm_score_var_id,
    ElementProperty.embed_scorm_suspend_data_var_id,
    ElementProperty.embed_scorm_progress_var_id,
  ],
  defaultOverrides: {},
  events: [ RuleEvent.on_scorm_finish, RuleEvent.on_scorm_initialize, RuleEvent.on_scorm_set_score, RuleEvent.on_close],
  actions: [ RuleAction.show, RuleAction.hide ]
}
