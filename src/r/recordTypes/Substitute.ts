export enum SubstituteProperty {
  substitute_source = "substitute_source",
  substitute_variable = "substitute_variable",
  substitute_text = "substitute_text",
}

export const substitutePropertyDefaults: Record<SubstituteProperty, unknown> = {
  [SubstituteProperty.substitute_source]: { uri: "", id: null },
  [SubstituteProperty.substitute_variable]: undefined,
  [SubstituteProperty.substitute_text]: ""
}