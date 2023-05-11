import { ElementProperty } from "../../../recordTypes/Element";
import { ItemProperty } from "../../../recordTypes/Item";
import { RuleAction } from "../../rules";
import { RuleEvent } from "../../rules";
import { BasicElement, ElementType,  IElementDefinition } from "../ElementDefinition";

export const ProductCard: IElementDefinition = {
  element_type: ElementType.product_card,
  elementDefaultName: "Product Card",
  properties: [
    ...BasicElement.properties,
    ElementProperty.heading,
    ElementProperty.short_description,
    ElementProperty.price,
    ElementProperty.price_color,
    ElementProperty.description,
    ElementProperty.image_sources,
    ElementProperty.threed_source,
    ElementProperty.show_add_to_cart_button,
    ElementProperty.add_to_cart_button_text,
    ElementProperty.add_to_cart_button_link,
    ElementProperty.background_source,
  ],
  defaultOverrides: {},
  itemProperties: [ItemProperty.item_text],
  itemDefaultOverrides: {},
  events: [ RuleEvent.on_product_card_cta1_click, RuleEvent.on_close ],
  actions: [
    RuleAction.show,
    RuleAction.hide
  ]
}
