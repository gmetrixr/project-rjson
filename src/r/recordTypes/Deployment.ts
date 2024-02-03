/** Stored in deployment.settings */
export enum DeploymentProperty {
  deployment_version = "deployment_version",
  geolock_enabled = "geolock_enabled",
  geolock_coordinates = "geolock_coordinates",
  geolock_range = "geolock_range",
  geolock_address = "geolock_address",
  track_location = "track_location",
  enable_multiplayer = "enable_multiplayer",
  multiplayer_audio_enabled = "multiplayer_audio_enabled",
  multiplayer_video_enabled = "multiplayer_video_enabled",
  multiplayer_chat_enabled = "multiplayer_chat_enabled",
  multiplayer_screenshare_enabled = "multiplayer_screenshare_enabled",
  multiplayer_comments_enabled = "multiplayer_comments_enabled",
  enable_room_instance = "enable_room_instance",
  room_instance_count = "room_instance_count",
  room_instance_member_limit = "room_instance_member_limit",
  room_instance_overspill_message = "room_instance_overspill_message",
  remember_user_login = "remember_user_login",
  remember_user_login_duration_hours = "remember_user_login_duration_hours"
}

export const deploymentPropertyDefaults:  Record<DeploymentProperty, unknown> = {
  [DeploymentProperty.deployment_version]: 0,
  [DeploymentProperty.geolock_enabled]: false,
  [DeploymentProperty.geolock_coordinates]: [0, 0],
  [DeploymentProperty.geolock_range]: 0,
  [DeploymentProperty.geolock_address]: "",
  [DeploymentProperty.track_location]: false,
  [DeploymentProperty.enable_multiplayer]: false,
  [DeploymentProperty.multiplayer_audio_enabled]: true,
  [DeploymentProperty.multiplayer_video_enabled]: true,
  [DeploymentProperty.multiplayer_chat_enabled]: true,
  [DeploymentProperty.multiplayer_screenshare_enabled]: true,
  [DeploymentProperty.multiplayer_comments_enabled]: false,
  [DeploymentProperty.enable_room_instance]: false,
  [DeploymentProperty.room_instance_count]: 1,
  [DeploymentProperty.room_instance_member_limit]: 6,
  [DeploymentProperty.room_instance_overspill_message]: "Looks like all rooms are full. Check back again after some time. You can still explore this space.",
  [DeploymentProperty.remember_user_login]: false,
  [DeploymentProperty.remember_user_login_duration_hours]: 24
};
