import { RecordNode, rtp, RT, RecordFactory } from "../../../r/R";
import { IOrder } from "../../IOrder";
import { ProjectFactory, SceneFactory } from "../../../r/recordFactories";

class Migration implements IOrder {
  execute (projectJson: any) {
    return migrateProject(projectJson);
  }
}

/**
 * In prevous migration, leadgen record id=1,2,3 caused a lot of issues. In the replacement map this was caught, 
 * and a lot of properties got changed from 1,2,3 to that number.
 * How to fix?
 * Get all leadgens and replace them with 1,2,3 in properties
 */
const migrateProject = (json: any) => {
  const pf = new ProjectFactory(json as RecordNode<RT.project>);
  const leadgenEntries = pf.getSortedRecordEntries(RT.lead_gen_field);
  const replacementMap: Record<number, number> = {};

  let shouldFix = true;
  for(const [leadgenId, _leadgenRecord] of leadgenEntries) {
    if(leadgenId < 100000) {
      shouldFix = false;
    }
  }
  if(leadgenEntries.length === 0) {
    shouldFix = false;
  }

  if(shouldFix) {
    let i = 1;
    for(const [leadgenId, _leadgenRecord] of leadgenEntries) {
      replacementMap[leadgenId] = i;
      i++;
    }

    const allTypesInProject = pf.getRecordTypes();
    for(const type of allTypesInProject) {
      for(const [id, record] of pf.getDeepRecordEntries(type)) { 
        new RecordFactory(record).changeRecordIdInProperties(replacementMap);
      }
    }
  }
  
  pf.set(rtp.project.version, 207);
  return json;
}

const migration = new Migration();
export default migration;
