import { RecordFactory } from "../R/RecordFactory";
import { ClipboardR, RecordNode } from "../R/RecordNode";
import { RT, rtp } from "../R/RecordTypes";
import { ElementType } from "../definitions/elements";
import { ElementFactory } from "./ElementFactory";
import { jsUtils } from "@gmetrixr/gdash";

const { deepClone, generateId } = jsUtils;

export class SceneFactory extends RecordFactory<RT.scene> {
  constructor(json: RecordNode<RT.scene>) {
    super(json);
  }

  /** Overriding add rule: Sub record ids should be made unique after duplications - this helps keeping all ids in the tree unique */
  addRecord <N extends RT>(this: SceneFactory, record: RecordNode<N>, position?: number): RecordNode<N> | undefined {
    const addedRecord = super.addRecord(record, position);
    if(addedRecord?.type === RT.rule) {
      this.dedupeWeTaIds(addedRecord);
    }
    return addedRecord;
  }

  /** 
   * adds record into the group if groupElementId is present
   * else adds record to the scene
   */
  addDeepRecord <N extends RT> (this: SceneFactory, { record, position, groupElementId }: { record: RecordNode<N>, position?: number, groupElementId?: number }): RecordNode<N> | undefined {
    if (groupElementId) {
      const group = this.getAllDeepChildrenWithFilter(RT.element, el => el.id === groupElementId);
      if (group[0] !== undefined) {
        const groupF = new ElementFactory(group[0]);
        const addedRecord = groupF.addRecord(record, position);
        return addedRecord;
      }
    } else {
      const addedRecord = this.addRecord(record, position);
      if(addedRecord?.type === RT.rule) {
        this.dedupeWeTaIds(addedRecord);
      }
      return addedRecord;
    }
  }

  /** Overriding duplicate rule: Sub record ids should be made unique after duplications - this helps keeping all ids in the tree unique */
  duplicateRecord <N extends RT>(this: SceneFactory, type: N, id: number): RecordNode<N> | undefined {
    const addedRecord = super.duplicateRecord(type, id);
    if(addedRecord?.type === RT.rule) {
      this.dedupeWeTaIds(addedRecord);
    }
    if(addedRecord?.type === RT.element) {
      this.dedupeGroupElements(addedRecord);
    }
    return addedRecord;
  }

  /**
   * Overriding duplicate rule: Sub record ids should be made unique after duplications - this helps keeping all ids in the tree unique
   */
  duplicateDeepRecord<N extends RT>(type: N, id: number): RecordNode<N> | undefined {
    const addedRecord =  super.duplicateDeepRecord(type, id);
    if(addedRecord?.type === RT.rule) {
      this.dedupeWeTaIds(addedRecord);
    }
    if(addedRecord?.type === RT.element) {
      this.dedupeGroupElements(addedRecord);
    }
    return addedRecord;
  }

  /** Overriding delete element: Deleting an element/variable (any CogObject) should also delete its rules */
  deleteRecord <N extends RT>(this: SceneFactory, type: N, id: number): RecordNode<N> | undefined {
    if(type === RT.element) {
      this.deleteRulesForCoId(id);
    }
    return super.deleteRecord(type, id);
  }

  /** Overriding delete deep element: Deleting an element/variable (any CogObject) should also delete its rules */
  deleteDeepRecord <N extends RT>(this: SceneFactory, type: N, id: number): RecordNode<N> | undefined {
    if(type === RT.element) {
      this.deleteRulesForCoId(id);
    }
    return super.deleteDeepRecord(type, id);
  }

  //ELEMENT SPECIFIC FUNCTIONS
  /**
   * Deleting an element/variable (any CogObject) should also delete its rules
   */
  deleteRulesForCoId (this: SceneFactory, id: number): void {
    for(const rule of this.getRecords(RT.rule)) {
      const ruleF = new RecordFactory(rule);
      ruleF.getRecords(RT.when_event)
        .filter(we => (we.props.co_id === id))
        .forEach(we => ruleF.deleteRecord(RT.when_event, we.id));
      ruleF.getRecords(RT.then_action)
        .filter(ta => (ta.props.co_id === id))
        .forEach(ta => ruleF.deleteRecord(RT.then_action, ta.id));
      if(ruleF.getRecordOrder(RT.when_event).length === 0 && ruleF.getRecordOrder(RT.then_action).length === 0) {
        this.deleteRecord(RT.rule, rule.id);
      }
    }
  }

  //RULE SPECIFIC FUNCTIONS
  /**
   * Makes sure all event ids and action ids don't clash with any of the event/actions ids in the current scene
   * This is useful when a rule is duplicated - we need to change the event_id's and action_id's of
   * all the WhenEvents and ThenActions inside the rule to unique ones.
   */
  dedupeWeTaIds (this: SceneFactory, rule: RecordNode<RT.rule>): void {
    const collectedIds: number[] = [];
    for(const r of this.getRecords(RT.rule)) {
      if(r.id === rule.id) continue; //This means we are at the same rule
      const rf = new RecordFactory(r);
      collectedIds.push(...rf.getRecordOrder(RT.when_event));
      collectedIds.push(...rf.getRecordOrder(RT.then_action));
    }

    const ruleFactory = new RecordFactory(rule);
    ruleFactory.getRecords(RT.when_event).forEach(we => {
      if(collectedIds.includes(we.id)) {
        ruleFactory.changeRecordId(RT.when_event, we.id);
      }
    });
    ruleFactory.getRecords(RT.then_action).forEach(ta => {
      if(collectedIds.includes(ta.id)) {
        ruleFactory.changeRecordId(RT.then_action, ta.id);
      }
    })
  }

  /**
   * Makes sure that all elements in a single scene have unique ids. This function ensures that whenever a group is duplicated (at any depth),
   * new ids are generated for all it's children
   * @param group
   */
  dedupeGroupElements(this: SceneFactory, group: RecordNode<RT.element>): void {
    const elementF = new ElementFactory(group);
    const elementType = elementF.get(rtp.element.element_type);
    if(elementType === ElementType.group) {
      // create new IDs for all elements
      // make a clone to start operating on the new reference
      const children = deepClone(elementF.getRecords(RT.element));

      // reset the original order to empty
      if(group.records?.element?.order) {
        group.records.element.order = [];
      }
      // reset the original map to empty
      if(group.records?.element?.map) {
        group.records.element.map = {};
      }

      // children are already ordered, start inserting after creating new IDs
      for(const child of children) {
        child.id = generateId();
        // * if the child is another group, dedupe again
        if(child.props.element_type === ElementType.group) {
          this.dedupeGroupElements(child);
        }
        elementF.addRecord(child);
      }
    }
  }

  /**
   * ISSUE : We were facing issue when we copy element from root to group, id for that element was duplicated and that was causing an issue. Below id fix for that
   * this function will add record with new element id to prevent duplicate issue.
   */
  pasteFromClipboardObject(this: SceneFactory, { obj, position, groupElementId }: {obj: ClipboardR, position?: number, groupElementId?: number}): (RecordNode<RT> | undefined)[] {
    if(obj.parentType !== this._type) {
      console.error(`Can't paste this object into a RecordNode of type of ${this._type}`);
      return [];
    }
    if (groupElementId !== undefined) {
      const group = this.getAllDeepChildrenWithFilter(RT.element, el => el.id === groupElementId);
      if (group[0] !== undefined) {
        const groupF = new ElementFactory(group[0] as RecordNode<RT.element>);
        return groupF.pasteFromClipboardObject({ obj, position });
      }
    }

    const addedRecords = [];
    for(const rn of obj.nodes) {
      // * if position is passed, then keep incrementing to insert in order, else add at the end of the list
      rn.id = generateId();
      if(rn.type === RT.element) {
        // * generate new ids if required for child elements. ex: group element children
        new ElementFactory(rn).dedupeChildElementIds();
      }
      const addedRecord = this.addRecord(rn, position? position++: position);
      if (addedRecord !== undefined) {
        addedRecords.push(addedRecord);
      }
    }
    return addedRecords;
  }
}
