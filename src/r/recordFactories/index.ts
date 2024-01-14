/** 
 * Exposing Custorm Factory Types through RF.*
 * RecordFacotry is exposed direclty through R.RecordFactory
 */
import { RecordFactory } from "../R/RecordFactory.js";
import { RT, RecordNode } from "../index.js";
import { ElementFactory } from "./ElementFactory.js";
import { ProjectFactory } from "./ProjectFactory.js";
import { SceneFactory } from "./SceneFactory.js";

export const getFactory = (rJson: RecordNode<RT>): RecordFactory<RT> => {
  switch(rJson.type) {
    case RT.project:
      return new ProjectFactory(rJson);
    case RT.scene:
      return new SceneFactory(rJson);
    case RT.element:
      return new ElementFactory(rJson);
    default:
      return new RecordFactory(rJson);
  }
}

export {
  ElementFactory,
  ProjectFactory,
  SceneFactory,
};
