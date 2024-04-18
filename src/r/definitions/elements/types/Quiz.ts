import { ElementProperty } from "../../../recordTypes/Element.js";
import { ItemProperty } from "../../../recordTypes/Item.js";
import { RuleAction } from "../../rules/index.js";
import { RuleEvent } from "../../rules/index.js";
import { BasicElement, ElementType,  IElementDefinition } from "../ElementDefinition.js";

export const Quiz: IElementDefinition = {
  element_type: ElementType.quiz,
  elementDefaultName: "Quiz",
  properties: [
    ...BasicElement.properties,
    ElementProperty.quiz_starting_instructions,
    ElementProperty.quiz_passing_score,
    ElementProperty.quiz_correct_score,
    ElementProperty.quiz_wrong_score,
    ElementProperty.quiz_show_starting_screen,
    ElementProperty.quiz_show_ending_screen,
    ElementProperty.quiz_randomize_options,
    ElementProperty.randomize_questions,
    ElementProperty.background_source
  ],
  defaultOverrides: {},
  itemProperties: [
    ItemProperty.item_text,
    ItemProperty.question_type, //"single" | "multiple"
  ],
  events: [ RuleEvent.on_end ],
  actions: [ RuleAction.show, RuleAction.hide ]
}
