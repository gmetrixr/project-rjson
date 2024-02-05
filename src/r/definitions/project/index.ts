export enum ViewerControlPanelPosition {
  top_right = "top_right",
  top_left = "top_left",
}

export enum InitialGraphicsSetting {
  adaptive = "adaptive",
  low = "low",
  high = "high",
}

export enum AvatarSystem {
  none = "none",
  rpm = "rpm",
  custom = "custom",
}

export enum AvatarQuality {
  high = "high",
  medium = "medium",
  low = "low",
}

export enum ViewerCameraMode {
  first_person = "first_person",
  third_person = "third_person"
}

export enum Language {
  en = "en",
  ja = "ja"
}

export enum SceneTransitionType { 
  fade_to_black = "fade_to_black", //default, optimized
  blend = "blend" //Older transition for 360 scenes only, takes more memory
}
