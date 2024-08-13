import { r, RF } from "../../../index.js";
import { VarCategory } from "../../../r/definitions/variables/VariableTypes.js";
import { RT, rtp } from "../../../r/R/index.js";
import { IOrder } from "../../IOrder.js";

class Migration implements IOrder {
  execute(projectJson: any) {
    return migrateProject(projectJson);
  }
}

const migrateProject = (json: any) => {
  const pf = r.project(json);
  const variables = pf.getRecords(RT.variable);
  
  for(const variable of variables) {
    const varF = new RF.RecordFactory(variable);
    const varCategory = varF.get(rtp.variable.var_category);
    if(varCategory === undefined) {
      varF.set(rtp.variable.var_category, VarCategory.user_defined);
    }
  }

  pf.set(rtp.project.version, 219);
  return json;
}

const migration = new Migration();
export default migration;
