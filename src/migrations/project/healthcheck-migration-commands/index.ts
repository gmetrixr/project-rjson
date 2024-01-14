import { RT, RecordNode } from "../../../r/index.js";
import { healthCheckMigration } from "./check_properties.js";

/**
 * Healthcheck migrations that are supposed to be run many times, ideally on the server
 */
export const projecHealthCheckMigrations = (projectJson: RecordNode<RT.project>): {projectJson: RecordNode<RT.project>, corrections: string[]} => {
  const rProjectJson = projectJson as RecordNode<RT.project>;
  const {corrections} = healthCheckMigration.execute(rProjectJson);
  return {projectJson: rProjectJson, corrections};
} 
