import { RecordFactory } from "../R/RecordFactory";
import { RecordNode, idAndRecord, idOrAddress } from "../R/RecordNode";
import { RT } from "../R/RecordTypes";

export class SceneFactory extends RecordFactory<RT.scene> {
  constructor(json: RecordNode<RT.scene>) {
    super(json);
  }

  /** Overriding delete element: Deleting an element/variable (any CogObject) should also delete its rules */
  deleteRecord<T>(id: number, type?: RT): idAndRecord<RT> | undefined {
    if(type === RT.element) {
      this.deleteRulesForCoId(id);
    }
    return super.deleteRecord(id, type);
  }

  /** Overriding delete deep element: Deleting an element/variable (any CogObject) should also delete its rules */
  deleteDeepRecord<T>(idOrAddress: idOrAddress): idAndRecord<RT> | undefined {
    const recordToDeleteRAndP = this.getRecordAndParent(idOrAddress);
    if(recordToDeleteRAndP !== undefined) {
      if(recordToDeleteRAndP.r.type === RT.element) {
        this.deleteRulesForCoId(recordToDeleteRAndP.id);
      }
      return super.deleteDeepRecord(idOrAddress);
    }
  }

  //ELEMENT SPECIFIC FUNCTIONS
  /** Given a CogObject (element/varaible), delete all rules associated with it */
  deleteRulesForCoId (id: number): void {
    //Get the rules for this scene
    for(const [ruleId, rule] of this.getRecordEntries(RT.rule)) {
      const ruleF = new RecordFactory(rule);
      ruleF.getRecordEntries(RT.when_event)
        .filter(([weId, we]) => (we.props.we_co_id === id))
        .forEach(([weId, we]) => ruleF.deleteRecord(weId, RT.when_event));
      ruleF.getRecordEntries(RT.then_action)
        .filter(([taId, ta]) => (ta.props.ta_co_id === id))
        .forEach(([taId, ta]) => ruleF.deleteRecord(taId, RT.then_action));
      if(ruleF.getRecords(RT.when_event).length === 0 && ruleF.getRecords(RT.then_action).length === 0) {
        this.deleteRecord(ruleId, RT.rule);
      }
    }
  }
}
