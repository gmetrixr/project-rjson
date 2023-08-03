import { IOrder } from "../IOrder";
import m199_200 from "./project-migration-commands/m199_200_initial_migration_from_rjson_to_rjson2_structure";
import m200_201 from "./project-migration-commands/m200_201_ta_we_prefix";
import m201_202 from "./project-migration-commands/m201_202_menu_tour_mode";
import m202_203 from "./project-migration-commands/m202_203_cycle_all_rule_ids";
import m203_204 from "./project-migration-commands/m203_204_fix_opacity_and_placer_3d";
import m204_205 from "./project-migration-commands/m204_205_scene_type_default";
import m205_206 from "./project-migration-commands/m205_206_element_ids_unique";
import m206_207 from "./project-migration-commands/m206_207_fix_props_with_leadgen_id";

export const projectMigrationTree: {[key: number]: IOrder} = {
  [199]: m199_200,
  [200]: m200_201,
  [201]: m201_202,
  [202]: m202_203,
  [203]: m203_204,
  [204]: m204_205,
  [205]: m205_206,
  [206]: m206_207,
};

export const getHighestProjectVersion = (): number => {
  const unorderedKeys = Object.keys(projectMigrationTree).map(n => parseInt(n)).sort((a,b) => (b - a));
  return unorderedKeys[0] + 1;
}

import create_first_scene from "./newproject-migration-commands/create_first_scene";
import create_predefined_vars from "./newproject-migration-commands/create_predefined_vars";

export const newProjectMigrationTree: {[key: number]: IOrder} = {
  [1]: create_first_scene,
  [2]: create_predefined_vars,
};
