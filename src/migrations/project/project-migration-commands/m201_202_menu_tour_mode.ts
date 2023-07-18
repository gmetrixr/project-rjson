import { RecordNode, rtp, RT, RecordFactory } from "../../../r/R";
import { IOrder } from "../../IOrder";
import { ProjectFactory, SceneFactory } from "../../../r/recordFactories";

class Migration implements IOrder {
  execute (projectJson: any) {
    return migrateProject(projectJson);
  }
}

/**
 * For projects that missed rjson migration v155_156 (the projects that got converted to v6 before that migration)
 */
const migrateProject = (json: any) => {
  const pf = new ProjectFactory(json as RecordNode<RT.project>);
  for(const [mId, menu] of pf.getRecordEntries(RT.menu)) {
    const menuF = new RecordFactory(menu);
    let sceneId = menuF.get(rtp.menu.menu_scene_id) as number;
    if(typeof sceneId === "string") {
      sceneId = Number(sceneId);
      menuF.set(rtp.menu.menu_scene_id, sceneId);
    }
    const scene = pf.getRecord(sceneId, RT.scene)
    if(scene) {
      const sceneF = new SceneFactory(scene);
      sceneF.set(rtp.scene.linked_menu_id, mId);
    }
  }
  
  for(const [tmId, tourMode] of pf.getRecordEntries(RT.tour_mode)) {
    const tourModeF = new RecordFactory(tourMode);
    let sceneId = tourModeF.get(rtp.tour_mode.tour_mode_scene_id) as number;
    if(typeof sceneId === "string") {
      sceneId = Number(sceneId);
      tourModeF.set(rtp.tour_mode.tour_mode_scene_id, sceneId);
    }
    const scene = pf.getRecord(sceneId, RT.scene)
    if(scene) {
      const sceneF = new SceneFactory(scene);
      sceneF.set(rtp.scene.linked_tour_mode_id, tmId);
    }
  }

  pf.set(rtp.project.version, 202);
  return json;
}

const migration = new Migration();
export default migration;
