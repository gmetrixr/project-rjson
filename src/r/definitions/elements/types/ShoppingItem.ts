import { RuleAction } from "../../rules";
import { BasicElement, ElementType,  IElementDefinition } from "../ElementDefinition";

export const ShoppingItem: IElementDefinition = {
  element_type: ElementType.shopping_item,
  elementDefaultName: "Shopping Item",
  properties: [ ...BasicElement.properties ],
  defaultOverrides: {},
  events: [ ],
  actions: [ RuleAction.show_product ]
}
