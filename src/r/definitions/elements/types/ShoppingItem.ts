import { RuleAction } from "../../rules/index.js";
import { BasicElement, ElementType,  IElementDefinition } from "../ElementDefinition.js";

export const ShoppingItem: IElementDefinition = {
  element_type: ElementType.shopping_item,
  elementDefaultName: "Shopping Item",
  properties: [ ...BasicElement.properties ],
  defaultOverrides: {},
  events: [ ],
  actions: [ RuleAction.show_product ]
}
