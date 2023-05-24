import { RecordNode, r, RT, vn } from "../../../r";
import { IOrder } from "../../IOrder";

/**
 * Adds predefined variables to the project json
 */
class Migration implements IOrder {
  execute(projectJson: unknown) {
    const pJson = projectJson as RecordNode<RT.project>;
    const projectF = r.project(pJson);

    // ! Add all predefined vars to this project, below function internally handles in cases of conflicts
    projectF.addPredefinedVariable(vn.PredefinedVariableName.browser_var);
    projectF.addPredefinedVariable(vn.PredefinedVariableName.device_var);
    projectF.addPredefinedVariable(vn.PredefinedVariableName.v_identifier_var);
    projectF.addPredefinedVariable(vn.PredefinedVariableName.firstname_var);
    projectF.addPredefinedVariable(vn.PredefinedVariableName.vrmode_var);
    projectF.addPredefinedVariable(vn.PredefinedVariableName.scorm_progress);
    projectF.addPredefinedVariable(vn.PredefinedVariableName.scorm_suspend_data);
    projectF.addPredefinedVariable(vn.PredefinedVariableName.scorm_score);
    projectF.addPredefinedVariable(vn.PredefinedVariableName.lastname_var);
    projectF.addPredefinedVariable(vn.PredefinedVariableName.fullname_var);
    projectF.addPredefinedVariable(vn.PredefinedVariableName.player_count_var);
  }
}

const migration = new Migration();
export default migration;
