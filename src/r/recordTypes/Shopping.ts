export enum ShoppingProperty {
  store_name = "store_name",
  plugin = "plugin", //renamed from "plugin_name"
  endpoint = "endpoint",
  currency_prefix = "currency_prefix",
  show_cart = "show_cart",
  cart_url = "cart_url",
  // * Shopify specific properties
  shopify_access_token = "shopify_access_token",
  shopify_domain = "shopify_domain"
}

export const shoppingPropertyDefaults: Record<ShoppingProperty, unknown> = {
  [ShoppingProperty.store_name]: "",
  [ShoppingProperty.plugin]: "",
  [ShoppingProperty.endpoint]: "",
  [ShoppingProperty.cart_url]: "",
  [ShoppingProperty.currency_prefix]: "",
  [ShoppingProperty.show_cart]: true,
  [ShoppingProperty.shopify_access_token]: "",
  [ShoppingProperty.shopify_domain]: ""
}