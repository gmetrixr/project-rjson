import { VariableBoolean } from "./types/VariableBoolean.js";
import { VariableNumber } from "./types/VariableNumber.js";
import { VariableString } from "./types/VariableString.js";
import { IVariableDefinition } from "./VariableTypes.js"
import { VariableType, isVariableType, DeviceVar, VarCategory, convertVarValueToType, variableTypeDefaults } from "./VariableTypes.js";
export { VariableType, isVariableType, DeviceVar, VarCategory, convertVarValueToType, variableTypeDefaults };

import { ArrayOfValues, PredefinedVariableName, VarValue, VarsMap, predefinedVariableDefaults, predefinedVariableIdToName } from "./VariableTypes.js";
export { ArrayOfValues, PredefinedVariableName, VarValue, VarsMap, predefinedVariableDefaults, predefinedVariableIdToName };

export const variableTypeToDefn: Record<VariableType, IVariableDefinition> = {
  [VariableType.boolean]: VariableBoolean,
  [VariableType.number]: VariableNumber,
  [VariableType.string]: VariableString,
};
