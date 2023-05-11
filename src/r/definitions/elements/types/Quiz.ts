import { ElementProperty } from "../../../recordTypes/Element";
import { ItemProperty } from "../../../recordTypes/Item";
import { RuleAction } from "../../rules";
import { RuleEvent } from "../../rules";
import { BasicElement, ElementType,  IElementDefinition } from "../ElementDefinition";

export const Quiz: IElementDefinition = {
  element_type: ElementType.quiz,
  elementDefaultName: "Quiz",
  properties: [
    ...BasicElement.properties,
    ElementProperty.quiz_starting_instructions,
    ElementProperty.quiz_passing_score,
    ElementProperty.quiz_correct_score,
    ElementProperty.quiz_wrong_score,
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
