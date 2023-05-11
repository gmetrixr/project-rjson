//export type LeadGenFieldProperties = Exclude<LeadGenFieldProperty, "id" | "name">;
export enum LeadGenFieldProperty {
  type = "type",
  validation = "validation",
  required = "required",
  var_id = "var_id",
  is_viewername = "is_viewername"
}

export const leadGenFieldPropertyDefaults: Record<LeadGenFieldProperty, unknown> = {
  [LeadGenFieldProperty.type]: "phone",
  [LeadGenFieldProperty.validation]: "",
  [LeadGenFieldProperty.required]: false,
  [LeadGenFieldProperty.var_id]: -1,
  [LeadGenFieldProperty.is_viewername]: false
}
