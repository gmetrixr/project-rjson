export enum DiscussionProperty {
  label = "label", // ! this is not required but kept as a placeholder for type checking
}

export const discussionPropertyDefaults: Record<DiscussionProperty, unknown> = {
  label: ""
}
