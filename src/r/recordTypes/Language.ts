
export enum LanguageProperty {
  override_value = "override_value",
}

export const languagePropertyDefaults: Record<LanguageProperty, unknown> = {
  [LanguageProperty.override_value]: "",
}

// export interface Language {
//   name: string, //Goes to record name
//   /** Used as the value in the auto variable insted of name, if present */
//   override_value?: string
// }
