import { ElementProperty } from "../../../recordTypes/Element.js";
import { ItemProperty } from "../../../recordTypes/Item.js";
import { RuleEvent } from "../../rules/index.js";
import { BasicElement, ElementType,  IElementDefinition } from "../ElementDefinition.js";

export const Popup: IElementDefinition = {
  element_type: ElementType.popup,
  elementDefaultName: "Popup",
  properties: [
    ...BasicElement.properties,
    ElementProperty.background_source,
    ElementProperty.linked_element_id,
  ],
  defaultOverrides: {
    [ElementProperty.hidden]: true 
  },
  itemProperties: [
    ItemProperty.item_heading,
    ItemProperty.item_description,
    ItemProperty.item_source,
    ItemProperty.item_source_type,
    ItemProperty.item_embed_string,
    ItemProperty.item_start,
    ItemProperty.item_end,
    ItemProperty.item_url,
  ],
  itemDefaultOverrides: {},
  events: [
    RuleEvent.on_close
  ],
  actions: [...BasicElement.actions]
}
