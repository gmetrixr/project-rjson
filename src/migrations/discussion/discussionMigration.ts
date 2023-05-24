import { IOrder } from "../IOrder";
import dc199_200 from "./discussion-migration-commands/dc199_200_initial_migration_from_rjson_to_rjson2_structure";

export const discussionMigrationTree: {[key: number]: IOrder} = {
  [199]: dc199_200,
};

export const getHighestDiscussionVersion = (): number => {
  const unorderedKeys = Object.keys(discussionMigrationTree).map(n => parseInt(n)).sort((a,b) => (b - a));
  return unorderedKeys[0] + 1;
}