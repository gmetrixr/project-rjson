import { RT, RecordNode, rtp } from "../../../r/R/index.js";
import { r } from "../../../r/index.js";
import { ElementType, eTypeToDefn } from "../../../r/definitions/elements/index.js";

/**
 * Migration to check if any porperties are used that aren't a part of the rjson definition
 * Can be used to understand what further migrations need to be written to get rid of these properties and make the project json smaller
 */
class HealthcheckMigration {
  execute(projectJson: unknown): {corrections: string[]} {
    const pJson = projectJson as RecordNode<RT.project>;
    const corrections: string[] = [];
    this.fixRecord(pJson, corrections);
    //To test locally:
    // for(const correction of corrections) {
    //   console.log(correction);
    // }
    return {corrections};
  }

  fixRecord(json: RecordNode<RT>, corrections: string[]) {
    const rf = r.record(json);
    for(const [id, record] of rf.getDeepRecordEntries()) {
      const type: RT = record.type as RT;
      if(type === RT.element) {
        const elementType: ElementType = record.props.element_type as ElementType;
        const allowedProperties = eTypeToDefn[elementType]?.properties;
        for(const property of r.record(record).getProps()) {
          //@ts-ignore
          if(allowedProperties[property] === undefined) {
            //property does not belong here
            corrections.push(`Record id ${id}|${record.type} has a property ${property} that is not defined in definitions for element ${elementType}`);
          }
        }
      } else {
        const allPossibleProps = rtp[type];
        for(const property of r.record(record).getProps()) {
          //@ts-ignore
          if(allPossibleProps[property] === undefined) {
            //property does not belong here
            corrections.push(`Record id ${id}|${record.type} has a property ${property} that is not defined in definitions`);
          }
        }
      }
    }
  }
}

const healthCheckMigration = new HealthcheckMigration();

export { healthCheckMigration };
