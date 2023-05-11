import { SpecialAllVariables } from "./types/SpecialAllVariables";
import { SpecialExperience } from "./types/SpecialExperience";
import { SpecialScene } from "./types/SpecialScene";
import { SpecialViewer } from "./types/SpecialViewer";
import { ISpecialDefinition, SpecialType, isSpecialType } from "./SpecialTypes";

export { SpecialType, isSpecialType };

import {
  SpecialRuleElementIds,
  allSpecialRuleElementIds,
  specialElementDisplayNames,
  SceneType,
  SceneCategory,
  sceneTypeDisplayNames,
  sceneTypeByCategory,
  sceneCategoryDisplayNames,
  shoppingPlugins,
  SceneEnvironment,
  SceneCollisionOptions,
  BloomKernelSize
} from "./SpecialTypes";
import { SpecialCurrentTimee } from "./types/SpecialCurrentTime";

export {
  SpecialRuleElementIds,
  allSpecialRuleElementIds,
  specialElementDisplayNames,
  SceneType,
  SceneCategory,
  sceneTypeDisplayNames,
  sceneTypeByCategory,
  sceneCategoryDisplayNames,
  shoppingPlugins,
  SceneEnvironment,
  SceneCollisionOptions,
  BloomKernelSize
};

/** These are types apart from elements and variables that get used as cogs */
export const specialTypeToDefn: Record<SpecialType, ISpecialDefinition> = {
  [SpecialType.experience]: SpecialExperience,
  [SpecialType.scene]: SpecialScene,
  [SpecialType.all_variables]: SpecialAllVariables,
  [SpecialType.viewer]: SpecialViewer,
  [SpecialType.current_time]: SpecialCurrentTimee,
};