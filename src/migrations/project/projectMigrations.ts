import { IOrder } from "../IOrder";
import m199_200 from "./project-migration-commands/m199_200_initial_migration_from_rjson_to_rjson2_structure";
import m200_201 from "./project-migration-commands/m200_201_ta_we_prefix";
import m201_202 from "./project-migration-commands/m201_202_menu_tour_mode";

export const projectMigrationTree: {[key: number]: IOrder} = {
  [199]: m199_200,
  [200]: m200_201,
  [201]: m201_202,
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
