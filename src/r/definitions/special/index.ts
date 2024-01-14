import { SpecialAllVariables } from "./types/SpecialAllVariables.js";
import { SpecialExperience } from "./types/SpecialExperience.js";
import { SpecialScene } from "./types/SpecialScene.js";
import { SpecialViewer } from "./types/SpecialViewer.js";
import { ISpecialDefinition, SpecialType, isSpecialType } from "./SpecialTypes.js";

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
} from "./SpecialTypes.js";

import { SpecialCurrentTimee } from "./types/SpecialCurrentTime.js";

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