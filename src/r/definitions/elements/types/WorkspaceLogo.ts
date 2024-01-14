import { FileType } from "../../files/index.js";
import { ElementProperty } from "../../../recordTypes/Element.js";
import { RuleEvent } from "../../rules/index.js";
import { BasicElement, ElementType,  IElementDefinition } from "../ElementDefinition.js";

export const WorkspaceLogo: IElementDefinition = {
  element_type: ElementType.workspace_logo,
  elementDefaultName: "Workspace Logo",
  properties: [
    ...BasicElement.properties,
    ElementProperty.opacity,
    ElementProperty.hidden,
    ElementProperty.locked,
    ElementProperty.hover_animation,
    ElementProperty.placer_3d,
    ElementProperty.wh,
    ElementProperty.scale,
    ElementProperty.animation,
    ElementProperty.billboarding,
    ElementProperty.use_proximity_optimization,
  ],
  defaultOverrides: {},
  events: [
    ...BasicElement.events,
    RuleEvent.on_press,
    RuleEvent.on_release
  ],
  actions: [
    ...BasicElement.actions
  ]
}
