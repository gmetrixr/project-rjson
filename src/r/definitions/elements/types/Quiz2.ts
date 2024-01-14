import { ElementProperty } from "../../../recordTypes/Element.js";
import { ItemProperty } from "../../../recordTypes/Item.js";
import { RuleAction } from "../../rules/index.js";
import { RuleEvent } from "../../rules/index.js";
import { BasicElement, ElementType,  IElementDefinition } from "../ElementDefinition.js";

export const Quiz2: IElementDefinition = {
  element_type: ElementType.quiz2,
  elementDefaultName: "Quiz 2.0",
  properties: [
    ...BasicElement.properties,
    ElementProperty.quiz_starting_instructions,
    ElementProperty.quiz_passing_score,
    ElementProperty.quiz_correct_score,
    ElementProperty.quiz_wrong_score,
    ElementProperty.randomize_questions,
    ElementProperty.background_source,
    ElementProperty.enable_pass_fail,
    ElementProperty.show_correct_answer_prompt,
    ElementProperty.linked_variable_id,
    ElementProperty.enable_skip,
    ElementProperty.subset_number,
  ],
  defaultOverrides: {},
  itemProperties: [
    ItemProperty.item_text,
    ItemProperty.question_type, //"single" | "multiple"
  ],
  events: [ RuleEvent.on_end, RuleEvent.on_quiz_fail, RuleEvent.on_quiz_pass ],
  actions: [ RuleAction.show, RuleAction.hide ]
}
