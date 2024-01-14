import { RecordFactory, RT, RecordNode, rtp } from "../../../r/R/index.js";
import { IOrder } from "../../IOrder.js";

class Migration implements IOrder {
  execute(deploymentSettingsJson: any) {
    delete deploymentSettingsJson.id;
    deploymentSettingsJson.order = 1;
    const depSettingsJson = deploymentSettingsJson as unknown as RecordNode<RT.deployment>;
    const depSettingsF = new RecordFactory(depSettingsJson);
    depSettingsF.set(rtp.deployment.deployment_version, 200);
    return depSettingsJson;
  }
}

const migration = new Migration();
export default migration;