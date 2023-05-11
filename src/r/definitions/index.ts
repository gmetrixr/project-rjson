import * as en from "./elements";
import * as sn from "./special";
import * as vn from "./variables";
import * as rn from "./rules";
import * as pn from "./project";
import * as fn from "./files";

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
