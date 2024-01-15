import { RecordNode, RT } from "../r/R/index.js";
import * as R from "./R/index.js";
import * as RF from "./RF.js";
import * as rUtils from "./rUtils.js";

const getFactory = (rJson: RecordNode<RT>): RF.RecordFactory<RT> => {
  switch(rJson.type) {
    case RT.project:
      return new RF.ProjectFactory(rJson);
    case RT.scene:
      return new RF.SceneFactory(rJson);
    case RT.element:
      return new RF.ElementFactory(rJson);
    default:
      return new RF.RecordFactory(rJson);
  }
}

/**
 * Use r.record(json) for all RecordNode type objects, except the below ones
 * For project, scene, rule and element only there are overridden factories
 */
const r = {
  "record":   <T extends RT>(json: RecordNode<T>): RF.RecordFactory<T> => new RF.RecordFactory(json),
  "project":  (json: RecordNode<RT.project>): RF.ProjectFactory => new RF.ProjectFactory(json),
  "scene":    (json: RecordNode<RT.scene>): RF.SceneFactory => new RF.SceneFactory(json),
  "element":  (json: RecordNode<RT.element>): RF.ElementFactory => new RF.ElementFactory(json),
}

export {
  R, RF, rUtils, getFactory, r,
}
