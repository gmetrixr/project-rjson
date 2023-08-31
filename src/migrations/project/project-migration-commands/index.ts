import { RT, RecordNode } from "../../../r";
import { IOrder } from "../../IOrder";
import initialRMigration from "./m199_200_initial_migration_from_rjson_to_rjson2_structure";
import m200_201 from "./m200_201_ta_we_prefix";
import m201_202 from "./m201_202_menu_tour_mode";
import m202_203 from "./m202_203_cycle_all_rule_ids";
import m203_204 from "./m203_204_fix_opacity_and_placer_3d";
import m204_205 from "./m204_205_scene_type_default";
import m205_206 from "./m205_206_element_ids_unique";
import m206_207 from "./m206_207_fix_props_with_leadgen_id";
import m207_208 from "./m207_208_remove_voice_recognition";
import m208_209 from "./m208_209_remove_ghost_menu";
import m209_210 from "./m209_210_legacy_scene_transition_type";

const projectMigrationTree: {[key: number]: IOrder} = {
  [200]: m200_201,
  [201]: m201_202,
  [202]: m202_203,
  [203]: m203_204,
  [204]: m204_205,
  [205]: m205_206,
  [206]: m206_207,
  [207]: m207_208,
  [208]: m208_209,
  [209]: m209_210,
};

const projectMigrationVersions: number[] = Object.keys(projectMigrationTree).map(numStr => parseInt(numStr)).sort((a, b) => (a - b));

export const getHighestProjectVersion = (): number => {
  const unorderedKeys = Object.keys(projectMigrationTree).map(n => parseInt(n)).sort((a,b) => (b - a));
  return unorderedKeys[0] + 1;
}

/**
 * Applies migrations for "r" type and returns a new project reference
 */
export const migrateProject = (projectJson: any, uptoVersion?: number): RecordNode<RT.project> => {
  // Check if project hasn't been converted to recordNode yet
  if(projectJson?.props?.version === undefined || projectJson?.props?.version < 199) {
    //The following step converts the json to "r" type and makes the version number 1
    projectJson = initialRMigration.execute(projectJson);
  }

  const rProjectJson = projectJson as RecordNode<RT.project>;
  let jsonVersion = rProjectJson?.props?.version as number ?? 0;
  if(uptoVersion === undefined) {
    uptoVersion = projectMigrationVersions[projectMigrationVersions.length - 1] + 1;
  }

  for(const key of projectMigrationVersions) {
    if(jsonVersion === key && key < uptoVersion) {
      console.log(`Running r migration ${key}`);
      projectMigrationTree[key].execute(projectJson);
      jsonVersion = projectJson.props.version as number;
    }
  }

  return projectJson;
}
