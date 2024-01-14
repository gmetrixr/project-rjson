import * as en from "./elements/index.js";
import * as sn from "./special/index.js";
import * as vn from "./variables/index.js";
import * as rn from "./rules/index.js";
import * as pn from "./project/index.js";
import * as fn from "./files/index.js";

/**
 * en: Element Namespace
 * sn: Scene Namespace
 * vn: Variable Namespace
 * rn: Rule Namespace
 * pn: Project Namespace
 * fn: File Namespace
 */
export {
  en, sn, vn, rn, pn, fn
};

export type CogObjectType = en.ElementType | vn.VariableType | sn.SpecialType;
