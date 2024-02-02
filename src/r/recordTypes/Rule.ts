// export type RuleProperties = Exclude<RuleProperty, "connection_id" | "connection_name" | "we_order" | "ta_order" >;

// TODO: Fix this
//export type CeType = ElementType | VariableType | SpecialType | string;
export type CeType = string;

export enum RuleProperty {
  accent_color = "accent_color",
  disabled = "disabled",
  tracked = "tracked",
  events_and = "events_and", //if true, works like an AND operand on all events. Else assume OR.
  comment = "comment",
  shared = "shared",
}

export const rulePropertyDefaults: Record<RuleProperty, unknown> = {
  [RuleProperty.accent_color]: "#8ED1FC",
  [RuleProperty.disabled]: false,
  [RuleProperty.tracked]: false,
  [RuleProperty.events_and]: true,
  [RuleProperty.comment]: "",
  [RuleProperty.shared]: false,
}
