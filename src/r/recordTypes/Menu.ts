export enum MenuProperty {
  menu_scene_id = "menu_scene_id",
  menu_show = "menu_show",
  menu_display_name = "menu_display_name"
}

export const menuPropertyDefaults: Record<MenuProperty, unknown> = {
  [MenuProperty.menu_scene_id]: 0,
  [MenuProperty.menu_show]: true,
  [MenuProperty.menu_display_name]: "",
}
