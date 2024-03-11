export enum lightType {
  ambient = "ambient",
  point = "point",
  directional = "directional"
}

export enum variantType {
  design_one = "design_one",
  design_two = "design_two"
}

export const SHOPPING_ITEM_ELEMENT_ID = -102

export type ShareAttributes = {
  url: string,
  text: string,
  platforms: string[], // ['facebook', 'twitter', 'linkedin']
};

export enum BillboardingTypes {
  y = "y",
  xy = "xy",
  xyz = "xyz"
}

export enum VolumeTypes {
  cube = "cube",
  cylinder = "cylinder",
  cone = "cone",
  sphere = "sphere",
  torus = "torus",
  polygon = "polygon"
}

export enum CharacterPoseTypes {
  idle = "idle",
  a_pose = "a_pose",
  t_pose = "t_pose",
  i_pose = "i_pose"
}

export enum MinimapAlignment {
 "top-left" = "top-left",
 "top-right" = "top-right",
 "bottom-left" = "bottom-left",
 "bottom-right" = "bottom-right",
 "bottom-center" = "bottom-center",
 "top-center" = "top-center",
}
