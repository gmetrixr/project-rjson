import { idAndRecord, RecordNode } from "../R/RecordNode.js";
import { RT, rtp } from "../R/RecordTypes.js";
import { SceneFactory } from "./SceneFactory.js";
import { ElementFactory } from "./ElementFactory.js";
import { en } from "../definitions/index.js";
import { SceneCollisionOptions, SceneType } from "../definitions/special/index.js";
import { ProjectFactory } from "./index.js";
import { ElementType } from "../definitions/elements/ElementDefinition.js";
import { sceneEnvironmentOptions } from "../definitions/special/SpecialTypes.js";

export class ProjectUtils {
  static setupNewScene(project: RecordNode<RT.project>, sceneIdAndRecord: idAndRecord<RT.scene>) {
    const projectF = new ProjectFactory(project);
    const sceneF = new SceneFactory(sceneIdAndRecord.record);
    const sceneId = sceneIdAndRecord.id;
    const sceneType = sceneF.get(rtp.scene.scene_type) as SceneType;
    // * Add a default pano
    projectF.addElementRecord({
      parentIdOrAddress: sceneId,
      elementType: ElementType.pano_image
    });

    if(sceneType === SceneType.six_dof) {
      sceneF.set(rtp.scene.scene_collision_type, SceneCollisionOptions.advanced_collision);
      // * Add a default environment
      const env = projectF.addElementRecord({parentIdOrAddress: sceneId, elementType: ElementType.object_3d});

      if(env) {
        const elementF = new ElementFactory(env.record);
        sceneF.changeRecordName(env.id, "Environment", RT.element);
        elementF.set(rtp.element.source, sceneEnvironmentOptions[0].source);
        elementF.set(rtp.element.scale, sceneEnvironmentOptions[0].scale);
        elementF.set(rtp.element.placer_3d, sceneEnvironmentOptions[0].placer_3d);
        elementF.set(rtp.element.locked, true);
        sceneF.set(rtp.scene.scene_bounds, sceneEnvironmentOptions[0].scene_bounds);
      }

      // * Add a spawn zone
      const zone = projectF.addElementRecord({parentIdOrAddress: sceneId, elementType: ElementType.zone});
      // * Reset the placer 3D for this zone element
      if(zone) {
        const elementF = new ElementFactory(zone.record);
        const defaultPlacer3D = elementF.getDefault(rtp.element.placer_3d);
        elementF.set(rtp.element.placer_3d, defaultPlacer3D);
      }

      const zoneElementId = zone?.id;
      const envElementId = env?.id;

      // * Assign the spawn zone to the scene
      sceneF.set(rtp.scene.scene_spawn_zone_id, zoneElementId);
      // * Add default light rig
      ProjectUtils.setupDefaultLightRig(project, sceneId, envElementId);
    } else {
      // * Add default light rig
      ProjectUtils.setupDefaultLightRig(project, sceneId);
    }
  }

  static setupDefaultLightRig(project: RecordNode<RT.project>, sceneId: number, envElementId?: number) {
    const projectF = new ProjectFactory(project);
    const group = projectF.addElementRecord({parentIdOrAddress: sceneId, elementType: ElementType.group});
    const useLegacyColorManagement = projectF.getValueOrDefault(rtp.project.use_legacy_color_management) as boolean;
    if(group) {
      group.record.name = `Lights`;
      const groupF = new ElementFactory(group.record);
      // add light rig to this groups
      const ambientLight = groupF.addElementOfType(en.ElementType.light);
      ambientLight.name = "Ambient Light";

      const ambientLightF = new ElementFactory(ambientLight);
      ambientLightF.set(rtp.element.light_type, en.lightType.ambient);
      ambientLightF.set(rtp.element.color, "#FFFFFF");
      ambientLightF.set(rtp.element.intensity, useLegacyColorManagement? 1: 3);

      const directionalLight = groupF.addElementOfType(en.ElementType.light);
      directionalLight.name = "Directional Light";

      const directionalLightF = new ElementFactory(directionalLight);
      directionalLightF.set(rtp.element.light_type, en.lightType.directional);
      directionalLightF.set(rtp.element.color, "#FFFFFF");
      directionalLightF.set(rtp.element.intensity, useLegacyColorManagement? 0.6: 3);
      directionalLightF.set(rtp.element.placer_3d, [0, 12, 4, 0, 0, 0, 1, 1, 1]);
      directionalLightF.set(rtp.element.target_element_id, envElementId);
    }
  }
}
