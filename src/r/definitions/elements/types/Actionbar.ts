import { ElementProperty } from "../../../recordTypes/Element.js";
import { ItemProperty } from "../../../recordTypes/Item.js";
import { RuleAction } from "../../rules/RuleAction.js";
import { RuleEvent } from "../../rules/RuleEvent.js";
import { BasicElement, ElementType, IElementDefinition } from "../ElementDefinition.js";

export const ActionBar: IElementDefinition = {
  element_type: ElementType.actionbar,
  elementDefaultName: "ActionBar",
  properties: [
    ...BasicElement.properties,
    ElementProperty.hidden,
    ElementProperty.actionbar_position,
    ElementProperty.actionbar_head,
    ElementProperty.color,
    ElementProperty.opacity,
    ElementProperty.collapsible,
  ],
  defaultOverrides: {
    [ElementProperty.hidden]: true,
    [ElementProperty.collapsible]: false,
    [ElementProperty.color]: "#484848",
    [ElementProperty.opacity]: 0.8
  },
  itemProperties: [ItemProperty.item_text, ItemProperty.item_source, ItemProperty.item_hidden],
  itemDefaultOverrides: {},
  events: [
    RuleEvent.on_click_item
  ],
  actions: [
    RuleAction.show,
    RuleAction.hide,
    RuleAction.show_item,
    RuleAction.hide_item,
    RuleAction.toggle_showhide,
  ]
}
