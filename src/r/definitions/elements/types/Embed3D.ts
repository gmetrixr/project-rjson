import { ElementProperty } from "../../../recordTypes/Element.js";
import { RuleEvent } from "../../rules/index.js";
import { BasicElement, ElementType, IElementDefinition } from "../ElementDefinition.js";

export const Embed3D: IElementDefinition = {
  element_type: ElementType.embed_3d,
  elementDefaultName: "Embed 3D",
  properties: [
    ...BasicElement.properties,
    ElementProperty.opacity,
    ElementProperty.hidden,
    ElementProperty.locked,
    ElementProperty.hover_animation,
    ElementProperty.placer_3d,
    ElementProperty.wh,
    ElementProperty.scale,
    ElementProperty.animation, //"bounce"/"fade"/"rotate"
    ElementProperty.billboarding,
    ElementProperty.embed_string,
  ],
  defaultOverrides: {},
  events: [
    ...BasicElement.events,
    RuleEvent.on_press,
    RuleEvent.on_release,
  ],
  actions: [
    ...BasicElement.actions,
  ],
};
