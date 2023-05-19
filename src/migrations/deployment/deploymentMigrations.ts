import { IOrder } from "../IOrder";
import d199_200 from "./deployment-migration-commands/d199_200_initial_migration_from_rjson_to_rjson2";

export const deploymentMigrationTree: {[key: number]: IOrder} = {
  [199]: d199_200,
};

export const getHighestDeploymentVersion = (): number => {
  const unorderedKeys = Object.keys(deploymentMigrationTree).map(n => parseInt(n)).sort((a,b) => (b - a));
  return unorderedKeys[0] + 1;
}
