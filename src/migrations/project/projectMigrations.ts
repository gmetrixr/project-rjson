import { IOrder } from "../IOrder";
import m199_200 from "./project-migration-commands/m199_200_initial_migration_from_rjson_to_rjson2_structure";

export const projectMigrationTree: {[key: number]: IOrder} = {
  [199]: m199_200,
};

export const getHighestProjectVersion = (): number => {
  const unorderedKeys = Object.keys(projectMigrationTree).map(n => parseInt(n)).sort((a,b) => (b - a));
  return unorderedKeys[0] + 1;
}