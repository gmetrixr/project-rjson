export enum AvatarProperty {
  source = "source",
}

export const avatarPropertyDefaults: Record<AvatarProperty, unknown> = {
  [AvatarProperty.source]: { id: null },
}
