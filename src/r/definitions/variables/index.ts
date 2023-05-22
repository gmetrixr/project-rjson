import { VariableBoolean } from "./types/VariableBoolean";
import { VariableNumber } from "./types/VariableNumber";
import { VariableString } from "./types/VariableString";
import { IVariableDefinition, VariableType, isVariableType, DeviceVar, VarCategory, convertVarValueToType } from "./VariableTypes";
export { VariableType, isVariableType, DeviceVar, VarCategory, convertVarValueToType };

import { ArrayOfValues, PredefinedVariableName, VarValue, predefinedVariableDefaults, predefinedVariableIdToName, ViewerStateStructure } from "./VariableTypes";
export { ArrayOfValues, PredefinedVariableName, VarValue, predefinedVariableDefaults, predefinedVariableIdToName, ViewerStateStructure };

export const variableTypeToDefn: Record<VariableType, IVariableDefinition> = {
  [VariableType.boolean]: VariableBoolean,
  [VariableType.number]: VariableNumber,
  [VariableType.string]: VariableString,
};
