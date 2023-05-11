//export type OptionProperties = Exclude<OptionProperty, "id">;
export enum OptionProperty {
  is_checked = "is_checked",
  option_text = "option_text",
}

export const optionPropertyDefaults: Record<OptionProperty, unknown> = {
  [OptionProperty.is_checked]: true,
  [OptionProperty.option_text]: "",
}
