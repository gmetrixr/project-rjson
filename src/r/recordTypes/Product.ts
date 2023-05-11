export enum ProductProperty {
  scene_id = "scene_id",
  element_id = "element_id",
  product_sku = "product_sku",
}

export const productPropertyDefaults = {
  [ProductProperty.scene_id]: 0,
  [ProductProperty.element_id]: 0,
  [ProductProperty.product_sku]: "",
}