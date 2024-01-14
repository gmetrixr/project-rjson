import { VarCategory, VariableType } from "../definitions/variables/VariableTypes.js";

// export type VariableProperties = Exclude<VariableProperty, "var_id" | "var_name">;
export enum VariableProperty {
  var_type = "var_type",
  var_default = "var_default",
  var_category = "var_category",
  //var_track is not defined for global vars
  //When copied over when a global var is added to a project, they should be set to true
  var_track = "var_track",
  //Remvoing var_readonly as it allows too many permutations.
  //Use other things to determine is a variable can be delted or renamed
  //Global vars (var_global=true) and Predefined Variables (id<0) can't be deleted or renamed
  // var_readonly = "var_readonly",
}

export const variablePropertyDefaults: Record<VariableProperty, unknown> = {
  [VariableProperty.var_type]: VariableType.number,
  [VariableProperty.var_default]: 0,
  [VariableProperty.var_category]: VarCategory.user_defined,
  [VariableProperty.var_track]: false,
};
