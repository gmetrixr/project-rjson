import * as R from "./R";
import { RecordNode, RecordMap, RT, RTP, rtp, createRecord, ClipboardData, idAndRecord } from "./R";
import { ProjectUtils } from "./recordFactories/ProjectFactory";;
import { RecordUtils } from "./R/RecordFactory";
import { ElementUtils } from "./recordFactories/ElementFactory";
import { ProjectFactory } from "./recordFactories/ProjectFactory";
import { RulesSearch } from "./recordFactories/RulesSearch";
import * as RF from "./recordFactories";
import { en, sn, vn, rn, pn, fn, CogObjectType } from "./definitions";

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
  ProjectFactory,
  RulesSearch,
}

const getFactory = (rJson: RecordNode<RT>): R.RecordFactory<RT> => {
  switch(rJson.type) {
    case RT.project:
      return new RF.ProjectFactory(rJson);
    case RT.scene:
      return new RF.SceneFactory(rJson);
    case RT.element:
      return new RF.ElementFactory(rJson);
    default:
      return new R.RecordFactory(rJson);
  }
}

export {
  R, r, RF, rUtils,
  //Exporting most used classes/types directly
  RecordNode, RecordMap, RT, RTP, rtp, createRecord, getFactory, ClipboardData, idAndRecord,
  en, sn, vn, rn, pn, fn, CogObjectType
}
