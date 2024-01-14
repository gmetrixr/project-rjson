import * as R from "./R/index.js";
import { RecordNode, RecordMap, RT, RTP, rtp, createRecord, ClipboardData, idAndRecord } from "./R/index.js";
import { ProjectFactory } from "./recordFactories/ProjectFactory.js";
import { RulesSearch } from "./recordFactories/RulesSearch.js";
import * as RF from "./recordFactories/index.js";
import { getFactory } from "./recordFactories/index.js";
import { en, sn, vn, rn, pn, fn, CogObjectType } from "./definitions/index.js";
import { RecordUtils } from "./R/RecordUtils.js"
import { ElementUtils } from "./recordFactories/ElementUtils.js"
import { ProjectUtils } from "./recordFactories/ProjectUtils.js"

/**
 * Use r.record(json) for all RecordNode type objects, except the below ones
 * For project, scene, rule and element only there are overridden factories
 */
const r = {
  "record":   <T extends RT>(json: RecordNode<T>): R.RecordFactory<T> => new R.RecordFactory(json),
  "project":  (json: RecordNode<RT.project>): RF.ProjectFactory => new RF.ProjectFactory(json),
  "scene":    (json: RecordNode<RT.scene>): RF.SceneFactory => new RF.SceneFactory(json),
  "element":  (json: RecordNode<RT.element>): RF.ElementFactory => new RF.ElementFactory(json),
}

const rUtils = {
  ProjectUtils,
  RecordUtils,
  ElementUtils,
  RulesSearch,
}

export {
  R, r, RF, rUtils,
  //Exporting most used classes/types directly
  RecordNode, RecordMap, RT, RTP, rtp, createRecord, getFactory, ClipboardData, idAndRecord,
  en, sn, vn, rn, pn, fn, CogObjectType
}
