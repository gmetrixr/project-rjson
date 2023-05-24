export enum DiscussionProperty {
  label = "label", // ! this is not required but kept as a placeholder for type checking
  version = "version",
}

export const discussionPropertyDefaults: Record<DiscussionProperty, unknown> = {
  [DiscussionProperty.label]: "",
  [DiscussionProperty.version]: 0,
}
