import { RecordNode, RecordMap, createRecord, RecordMapGeneric } from "./RecordNode";
import { RT, RTP, recordTypeDefinitions, isRecordType, rtp, isTypeChildOf, isTypeSubChildOf } from "./RecordTypes";
import { jsUtils, stringUtils } from "@gmetrixr/gdash";

const { deepClone, generateIdV2 } = jsUtils;
const { getSafeAndUniqueRecordName } = stringUtils;

/** id: child id, r: child RecordNode, p: parent RecordNode */
export type rAndP = {id: number, r: RecordNode<RT>, p: RecordNode<RT> };
export type idAndRecord = {id: number, record: RecordNode<RT>};
export type idOrAddress = number | string;
/** clipboard contains the strigified version of this */
export interface ClipboardData {
  nodes: idAndRecord[]
}
/**
 * A convenient Factory class to maninpulate a RecordNode object of any type
 * This class can be extended to provide any recordType specific funcitonality
 *
 * Using arrow functions in Classes has a runtime performance cost. The constructor bloats up.
 * Solution: https://www.typescriptlang.org/docs/handbook/2/classes.html#this-parameters
 * 
 * JSON Structure:
 * 
 * { //RecordNode -> A recordNode doesn't know what it's id is. The id is defined one level above
 *   name: "string" //optional record name
 *   type: "project"
 *   order: "integer" //the order of the record in the list
 *   props: {"key1": "value1", "key2", "value2"} //All properties in a record
 *   records: {
 *     "scene": { //Scene RecordMap
 *       "7878789089": { //record id 1
 *          //Sub RecordNode 1
 *       },
 * *     "7878789777": { //record id 2
 *          //Sub RecordNode 2
 *       }
 *     }
 *     "variable": {} //Varaible RecordMap
 *   }
 * }
 * 
 * PROPS
 * json / getName -> return full json / return name
 * getProps/getAllPossibleProps -> what this json has/what this json can have (based on type)
 * get/set/reset/delete/getValueOrDefault/getDefault -> prop's values
 * changePropertyName -> used during migrations
 * 
 * RECORDS
 * getRecordTypes -> list of subrecord types ["scene", "variable"]
 * getRecord / getDeepRecord -> get subrecord of any type (level 1), faster if type is passed / deepRecord using idOrAddress
 * getRecordMap / getDeepRecordMap -> recordMap of one type (all types when type isn't passed) / deepRecordMap of all types
 * getRecordEntries / getRecords / getRecordIds -> get list of level 1 records/ids/entries, of an optional type
 * 
 * SORTED RECORDS (FOR UI)
 *   Sorting only makes sense in a single type (eg: you wont sort variables & scenes)
 * getSortedRecordEntries / getSortedIds / getSortedRecords
 * 
 * ADDRESS RELATED
 * getAddress -> Get address of a subnode (with optional property suffix)
 * getPropertyAtAddress / updatePropertyAtAddress
 * $ private getRecordAndParentWithId / getRecordAndParentWithAddress
 * getRecordAndParent -> Find record and its parent with either id or address
 * $ private getBreadCrumbsWithAddress / getBreadCrumbsWithId
 * getBreadCrumbs -> Returns an array of all sub-records leading to the given idOrAddress
 * 
 * RECORD RELATED
 * changeDeepRecordId -> Updates all references to a recordId in the tree and in properties
 * cycleAllRecordIds -> Changes all ids
 * $ private getNewOrders / initializeRecordMap
 * addRecord / addBlankRecord
 * deleteRecordsLinkedToId -> Delete subrecords at any depth which have any prop value = id
 * duplicateRecord     / deleteRecord     / changeRecordName
 * duplicateDeepRecord / deleteDeepRecord / changeDeepRecordName
 * 
 * MOVE/COPY/CLIPBOARD
 * reorderRecords / copyDeepRecords / moveDeepRecords
 * copyToClipboard / pasteFromClipboard
 */
export class RecordFactory<T extends RT> {
  protected readonly _json: RecordNode<T>;
  protected readonly _type: RT;

  constructor(json: RecordNode<T>) {
    this._json = json;
    if (isRecordType(json.type)) {
      this._type = json.type;
    } else {
      throw Error(`json.type is not a known RecordType`);
    }
    return this;
  }

  json(): RecordNode<T> {
    return this._json;
  }

  getName(): string | undefined {
    return this._json.name;
  }

  /** A list of recordNode.props' keys in the json */
  getProps(): string[] {
    return Object.keys(this._json.props);
  }
  
  /** 
   * A list of props this RecordType is supposed to have. 
   * This is different from getProps - 
   * getProps tells you what the json has
   * getAllPossibleProps tell you what the json can have
   */
  getAllPossibleProps(): string[] {
    return Object.keys(rtp[this._type]);
  }

  /** In case a property isn't defined in the json, this method returns "undefined" */
  get(property: RTP[T]): unknown {
    return this._json.props[property];
  }

  set(property: RTP[T], value: unknown): RecordFactory<T> {
    this._json.props[property] = value;
    return this;
  }

  reset(property: RTP[T]): RecordFactory<T> {
    this._json.props[property] = this.getDefault(property);
    return this;
  }

  delete(property: string): RecordFactory<T> {
    delete (this._json.props)[property as RTP[T]];
    return this;
  }

  /**
   * Returns the value of a property, or it default in case the value isn't defined.
   * In case there is no default defined, it returns "undefined"
   */
  getValueOrDefault(property: RTP[T]): unknown {
    //In case actual value exists, return that
    if (this.get(property) !== undefined) {
      return this.get(property);
    } else {
      return this.getDefault(property);
    }
  }

  /**
   * Returns a clone default value of a property. If no default is found, returns undefined
   * Note: the returned object is a cloned value to avoid reuse of references across r objects
   */
  getDefault(property: RTP[T]): unknown {
    const defaultValues = recordTypeDefinitions[this._type].defaultValues;
    if (defaultValues[property] === undefined) return undefined;
    return deepClone(defaultValues[property]);
  }

  /** Used mostly for migrations. And so this fn doesn't do type check on property name. */
  changePropertyName(propertyName: string, newPropertyName: string): RecordFactory<T> {
    //@ts-ignore
    if (this._json.props[propertyName] !== undefined) {
      //@ts-ignore
      this._json.props[newPropertyName] = this._json.props[propertyName];
      //@ts-ignore
      delete this._json.props[propertyName];
    }
    return this;
  }

  /** A list of Records this json has (eg: project might have scene, variable, menu) */
  getRecordTypes(): RT[] {
    return Object.keys(this._json.records ?? {}) as RT[];
  }
  

  /** 
   * Returns all sub records (one-lvl deep) of a either a single type or all types (if type is not passed)
   */
  getRecordMap<N extends RT>(type?: N): RecordMap<N> {
    if(type === undefined) {
      const recordMap: RecordMapGeneric = {};
      if(this._json.records === undefined) return recordMap;
      for (const type of this.getRecordTypes()) {
        const recordMapOfType = this.getRecordMap(type);
        Object.assign(recordMap, recordMapOfType);
      }
      return recordMap;
    } else {
      const recordMap: RecordMap<N> = this._json.records?.[type] ?? {};
      return recordMap;
    }
  }

  getRecordEntries<N extends RT>(type?: N): [number, RecordNode<N>][] {
    return Object.entries(this.getRecordMap(type))
            .map((entry): [number, RecordNode<RT>] => [Number(entry[0]), entry[1]]);
  }

  getRecords<N extends RT>(type?: N): RecordNode<N>[] {
    return Object.values(this.getRecordMap(type));
  }

  getRecordIds<N extends RT>(type?: N): number[] {
    return Object.keys(this.getRecordMap(type)).map(i => Number(i));
  }

  /**
   * A flattened record map of all ids and records in a tree, of all types
   * If there are two records with the same id, this function will fail
   * Uses BFS within a type, and DFS across types
   * The optional argument recordMap exists only for its internal functioning
   */
  getDeepRecordMap(recordMap?: RecordMapGeneric): RecordMapGeneric {
    if(recordMap === undefined) recordMap = {};
    for (const type of this.getRecordTypes()) {
      const recordMapOfType = this.getRecordMap(type);
      Object.assign(recordMap, recordMapOfType);

      for(const record of Object.values(recordMapOfType)) {
        new RecordFactory(record).getDeepRecordMap(recordMap); //records get added to the same object
      }
    }
    return recordMap;
  }

  getRecord(id: number, type?: RT): RecordNode<RT> | undefined {
    if(type == undefined) {
      return this.getRecordMap()[id];
    } else {
      return (this._json.records?.[type] as RecordMap<RT>)?.[id];
    }
  }

  /** if idOrAddress is "", it refers to the current node */
  getDeepRecord(idOrAddress: idOrAddress): RecordNode<RT> | undefined {
    if(typeof idOrAddress === "number") {
      return this.getDeepRecordMap()[idOrAddress];
    } else if (idOrAddress === "") { //blank address refers to self record
      return this._json;
    } else {
      return this.getRecordAndParentWithAddress(idOrAddress)?.r;
    }
  }

  /**
   * Ensures that all records of a given type have the ".order" key in them. 
   * This function finds the max order, and increments the order by 1 for each new entry
   */
  private ensureOrderKeyPresentOfType(type: RT) {
    const valuesArray = Object.values(this.getRecordMap(type));

    let undefinedFound = false;
    let maxOrder = 0;
    for(const v of valuesArray) {
      if(v.order === undefined) {
        undefinedFound = true;
        break;
      } else {
        if(v.order > maxOrder) {
          maxOrder = v.order;
        }
      }
    }
    if(undefinedFound === false) return;

    for(const v of valuesArray) {
      if(v.order === undefined) {
        //create an order key in the record if it doesn't exist
        v.order = maxOrder + 1;
        maxOrder++;
      }
    }
  }

  /** ORDERED entries of id, records. Returns ids as strings. */
  getSortedRecordEntries(type: RT): [number, RecordNode<RT>][] {
    this.ensureOrderKeyPresentOfType(type);
    const entriesArray = Object.entries(this.getRecordMap(type));
    //We know that at this point order is not undefined. So we just forcefully cast it to a number.
    const numberEntriesArray = entriesArray
      .sort((a,b) => {return <number>a[1].order - <number>b[1].order})
      .map((entry): [number, RecordNode<RT>] => [Number(entry[0]), entry[1]]);
    return numberEntriesArray;
  }

  /** ORDERED ids */
  getSortedRecordIds(type: RT): number[] {
    const entriesArray = this.getSortedRecordEntries(type);
    return entriesArray.map(nodeEntry => nodeEntry[0]);
  }

  /** ORDERED records */
  getSortedRecords<N extends RT>(type: N): RecordNode<N>[] {
    const entriesArray = this.getSortedRecordEntries(type);
    return entriesArray.map(nodeEntry => nodeEntry[1]);
  }

  /**
   * Generate an address like scene:1|element:2 for any child RecordNode
   * RFC: https://docs.google.com/document/d/1DVM_i_Go5iX5-EShV5FikfI29k8YEC9cAjzeAY49blc/edit#
   * Eg 1. scene:1|element:2!opacity
   * Eg 2. scene:1|element:2!wh>1
   * If property is given, it adds property suffix
   * If selfAddr is given (from root), it prefixes that to the address, otherwise returns a partial child address
   */
  getAddress<N extends RT>({id, type, selfAddr, property, index}: {
    id: number, type?: N, selfAddr?: string, property?: RTP[T], index?: number
  }): string {
    //If record isn't present, return;
    const record = type ? this.getRecord(id, type) : this.getRecord(id);
    if(record === undefined) return "";
    //If type isn't given, get the type from the record
    if(!type) { type = <N> record.type; }
    //Get record address
    const childPartialAddress = `${type}:${id}`;
    let address = selfAddr ? `${selfAddr}|${childPartialAddress}`: childPartialAddress;
    //If property is given, append that
    if(property) {
      const propertySuffix = (typeof index === "number") ? `${property}>${index}` : `${property}`
      address = `${address}!${propertySuffix}`;
    }
    return address;
  }
  
  /** Find a record and its parent given any record id */
  private getRecordAndParentWithId<N extends RT>(id: number): rAndP | undefined {
    const recordMap = this.getRecordMap();
    for(const [key, value] of Object.entries(recordMap)) {
      if(id === Number(key)) {
        //Found it!!! return the rAndP object
        return {p: this._json, r: recordMap[id], id: id};
      }
      const subRecordRAndP = new RecordFactory(value).getRecordAndParentWithId(id);
      if(subRecordRAndP !== undefined) {
        return subRecordRAndP;
      }
    }
  }

  /**
   * Find the record and its parent with a given address. Searches only in child record nodes.
   * Examples
   * 1. scene:1
   * 2. scene:1|element:2
   * 3. scene:1|element:2!opacity
   * 4. scene:1|element:2!wh>1
   */
  private getRecordAndParentWithAddress(addr: string): rAndP | undefined {
    // Sanitize and remove and unwanted cases
    // Replace everything after a ! with a blank string
    const recordStringArray = addr.replace(/!.*/, "").split("|"); // [scene:1, element:2]
    if(recordStringArray.length === 0 || this._json.records === undefined) {
      return undefined;
    }
    let parentR: RecordNode<RT> = this._json;
    let childR: RecordNode<RT> = this._json;
    let childId = 0;
    for (let i = 0; i < recordStringArray.length; i++) {
      parentR = childR;
      const [type, id] = recordStringArray[i].split(":"); // [scene, 1]
      let newChild = new RecordFactory(parentR).getRecord(Number(id), type as RT);
      if(newChild === undefined) return undefined;
      childR = newChild;
      childId = Number(id);
    }
    const rAndP: rAndP = { id: childId, r: childR, p: parentR };
    return rAndP;
  }

  getRecordAndParent(idOrAddress: idOrAddress): rAndP | undefined {
    if(typeof idOrAddress === "number") {
      return this.getRecordAndParentWithId(idOrAddress);
    } else {
      return this.getRecordAndParentWithAddress(idOrAddress);
    }
  }

  private getBreadCrumbsWithId<N extends RT>(id: number, breadCrumb?: idAndRecord[]): idAndRecord[] | undefined {
    if(breadCrumb === undefined) breadCrumb = [];

    const recordMap = this.getRecordMap();
    for(const [key, value] of Object.entries(recordMap)) {
      if(id === Number(key)) {
        //Found it!!! return the rAndP object
        const lastEntry: idAndRecord = {id: Number(key), record: value};
        return [lastEntry];
      }
      const breadCrumbArray = new RecordFactory(value).getBreadCrumbsWithId(id);
      if(breadCrumbArray !== undefined) {
        const currentEntry: idAndRecord = {id: Number(key), record: value};
        breadCrumbArray.splice(0, 0, currentEntry);
        return breadCrumbArray;
      }
    }
    return undefined;
  }

  private getBreadCrumbsWithAddress(addr: string): idAndRecord[] | undefined {
    const breadCrumbs: idAndRecord[] = []
    // Sanitize and remove and unwanted cases
    // Replace everything after a ! with a blank string
    const recordsStringArray = addr.replace(/!.*/, "").split("|"); // [scene:1, element:2]
    if(recordsStringArray.length === 0 || this._json.records === undefined) {
      return undefined;
    }
    let parentR: RecordNode<RT> = this._json;
    let childR: RecordNode<RT> = this._json;
    let childId = 0;
    for (let i = 0; i < recordsStringArray.length; i++) {
      parentR = childR;
      const [type, id] = recordsStringArray[i].split(":"); // [scene, 1]
      let newChild = new RecordFactory(parentR).getRecord(Number(id), type as RT);
      if(newChild === undefined) return undefined;
      childR = newChild;
      childId = Number(id);
      breadCrumbs.push({id: childId, record: childR});
    }
    return breadCrumbs;
  }

  getBreadCrumbs(idOrAddress: idOrAddress): idAndRecord[] | undefined {
    if(typeof idOrAddress === "number") {
      return this.getBreadCrumbsWithId(idOrAddress);
    } else {
      return this.getBreadCrumbsWithAddress(idOrAddress);
    }
  }
  
  /**
   * Given an address like scene:1|element:2!wh>1, get its value
   * If it doesn't find a value, return undefined
   */
  getPropertyAtAddress(addr: string): unknown {
    const recordAtAddress = this.getDeepRecord(addr);
    if(!recordAtAddress) return undefined;
    // find the matching property value string and then remove the ! from the lead
    const propertyAddr = addr.match(/!.*/)?.[0]?.replace("!", ""); // ex: !scene_yaw_correction
    if(!recordAtAddress || !propertyAddr) return undefined;
    const [property, index] = propertyAddr.split(">");
    const recordF = new RecordFactory(recordAtAddress);
    const propertyValue = recordF.getValueOrDefault(property as RTP[T]);
    return (index === undefined) ? propertyValue : (propertyValue as [])[Number(index)];
  }

  /**
   * Update the value of a property at an address
   * 1. scene:1|element:2!opacity
   * 2. scene:1|element:2!wh>1
   */
  updatePropertyAtAddress(addr: string, value: unknown): boolean {
    const recordAtAddress = this.getDeepRecord(addr);
    if(!recordAtAddress) return false;
    const propertyAddr = addr.match(/!.*/)?.[0]?.replace("!", ""); // ex: !scene_yaw_correction
    if(!recordAtAddress || !propertyAddr) return false;
    const [property, index] = propertyAddr.split(">");
    const recordF = new RecordFactory(recordAtAddress);
    if(index === undefined) {
      recordF.set(property as RTP[T], value);
      return true;
    } else {
      const propertyValue = recordF.getValueOrDefault(property as RTP[T]);
      if(Array.isArray(propertyValue)) {
        propertyValue[Number(index)] = value;
        recordF.set(property as RTP[T], propertyValue);
        return true;
      }
    }
    return false;
  }

  /** 
   * Updates all references to a recordId in the tree and in properties 
   */
  changeDeepRecordId(id: number, newId?: number): number {
    if (newId === undefined) newId = generateIdV2();

    //Change all property values that refer to the older id
    for(const prop of this.getProps()) {
      if(this._json.props[(prop as RTP[T])] === id) {
        this._json.props[(prop as RTP[T])] = newId;
      }
    }
    
    for (const type of this.getRecordTypes()) {
      const recordMapOfType = this.getRecordMap(type);
      for(const [key, value] of Object.entries(recordMapOfType)) {
        if(id === Number(key)) {
          recordMapOfType[newId] = recordMapOfType[id];
          delete recordMapOfType[id];
        }
        //Go deeper and change all references in sub-records also (and check if the id exists deeper also)
        new RecordFactory(value).changeDeepRecordId(id, newId);  
      }
    }

    return newId;
  }

  /** Change all sub-record ids (of sub-records) in this RecordNode */
  cycleAllSubRecordIds(): void {
    //Get all record ids
    const allRecordsMap = this.getDeepRecordMap();
    for(const key of Object.keys(allRecordsMap)) {
      this.changeDeepRecordId(Number(key));
    }
  }

  /**
   * Adding ".order" key to the new entry - even if the record already had a .order, we will overwrite it
   * potential value of respective orders: [4, 4.5, 4.75, 5, 8]
   * newRecordsCount: the number of new records to enter
   * meaning of "position" - the [gap] to insert into: [0] 0, [1] 1, [2] 2, [3] 3, [4] 4 [5]
   * if this is the only record, order = 1
   * if its inserted at [0], order = order of the first entry - 1
   * if its inserted at [5], order = order of the last entry + 1 (default, when position is undefined)
   * if its inserted at [x], order = ( order of [x - 1] entry + order of [x] entry ) / 2 
   */
  private getNewOrders(sortedRecords: RecordNode<T>[], newRecordsCount: number, position?: number): number[] {
    let order = [];
    let minOrder = sortedRecords[0]?.order ?? 0;
    let maxOrder = sortedRecords[sortedRecords.length - 1]?.order ?? 0;
    if(sortedRecords.length === 0) { //return [1, 2, 3 ...]
      for(let i=0; i<newRecordsCount; i++) {
        order[i] = i+1;
      }
    } else if(position === 0) {
      for(let i=0; i<newRecordsCount; i++) {
        minOrder = minOrder-1;
        order[i] = minOrder;
      }
    } else if(position === sortedRecords.length || position === undefined) {
      for(let i=0; i<newRecordsCount; i++) {
        maxOrder = maxOrder+1;
        order[i] = maxOrder;
      }
    } else {
      const prevOrder = sortedRecords[position - 1].order ?? 0;
      const nextOrder = sortedRecords[position].order ?? 0;
      let segment = 0;
      for(let i=0; i<newRecordsCount; i++) {
        segment += 1;
        order[i] = prevOrder + (nextOrder - prevOrder) / (newRecordsCount + 1) * segment;
      }
    }
    return order;
  }

  private initializeRecordMap(type:RT): boolean {
    if (!isRecordType(type)) {
      console.error(`Unable to add record because record type ${type} isn't a known record type`);
      return false;
    }

    //We can't use getRecordMap() - as it to replaces undefined with {}, and we don't want that here
    let recordMap = <RecordMap<RT>> this._json.records?.[type];
    if (recordMap === undefined) {
      //Check if this type of sub-record is supposed to exist in this type
      if (!isTypeChildOf(this._type, type)) {
        console.log(`The type ${this._json.type} doesn't allow addition of ${type} records`);
        return false;
      }
      if (this._json.records === undefined) {
        this._json.records = {};
      }
      this._json.records[type] = {};
    }
    return true;
  }

  /**
   * Definition of "position" - the [gap] to insert into: [0] 0, [1] 1, [2] 2, [3] 3, [4] 4 [5]
   * If position is undefined, it gets inserted at the end
   * All ids in the tree need to be unique. 
   * So we first get all existing sub-ids. 
   * And all sub-ids in this new record. 
   * And make sure none overlap.
   */
  addRecord<T>({record, position, id, dontCycleSubRecordIds, parentIdOrAddress}: {
    record: RecordNode<RT>, position?: number, id?: number, dontCycleSubRecordIds?: boolean, parentIdOrAddress?: idOrAddress
  }): idAndRecord | undefined {
    if(parentIdOrAddress !== undefined) {
      const parentRecord = this.getDeepRecord(parentIdOrAddress);
      if(parentRecord === undefined) return undefined;
      return new RecordFactory(parentRecord).addRecord({record, position, id, dontCycleSubRecordIds});
    }
    const type = <RT> record.type;
    if(!this.initializeRecordMap(type)) return undefined;
    const recordMap = this.getRecordMap(type);
    const recordsArray = this.getSortedRecords(type);
    record.order = this.getNewOrders(recordsArray, 1, position)[0];
    if(!dontCycleSubRecordIds) {
      //Cycle all ids in the new record being added so that there are no id clashes
      new RecordFactory(record).cycleAllSubRecordIds();
    }

    if(id === undefined) {
      id = generateIdV2();
    }
    recordMap[id] = record;
    //This fn make sure that the name isn't a duplicate one, and also that its given only if its required
    this.changeRecordName(id, record.name, type);
    return {id, record};
  }

  addBlankRecord<N extends RT>(type: N, position?: number): idAndRecord | undefined {
    const record = createRecord(type);
    return this.addRecord({record, position});
  }

  duplicateRecord<N extends RT>(type: N, id: number): idAndRecord | undefined {
    const orig = this.getRecord(id, type);
    if (orig === undefined) return undefined;
    const clonedJson = deepClone(orig);

    //get the position
    const ids = this.getSortedRecordIds(<RT> orig.type);
    const origPositionIndex = ids.indexOf(id);

    //addRecord makes sure that the id of the record itself isn't duplicate amongst its siblings
    //Also makes sure that the cloneJson.order is correct
    return this.addRecord<N>({record: clonedJson, position: origPositionIndex + 1});
  }

  duplicateDeepRecord<T>(idOrAddress: idOrAddress): rAndP | undefined {
    const rAndP = this.getRecordAndParent(idOrAddress);
    if(rAndP === undefined) return undefined;
    const duplicatedIdAndRecord = new RecordFactory(rAndP.p).duplicateRecord(rAndP.r.type as RT, rAndP.id);
    if(duplicatedIdAndRecord === undefined) return undefined;
    rAndP.id = duplicatedIdAndRecord?.id;
    rAndP.r = duplicatedIdAndRecord.record;
    return rAndP;
  }

  deleteRecord<N extends RT>(id: number, type?: N): idAndRecord | undefined {
    const recordToDelete = this.getRecord(id, type);
    if(recordToDelete === undefined) return undefined;

    const recordMapOfType = this.getRecordMap(recordToDelete.type as RT);
    delete recordMapOfType[id];
    return {id, record: recordToDelete};
  }

  deleteRecordsLinkedToId(id: number) {
    const allRecords = this.getDeepRecordMap();
    for(const [recordId, record] of Object.entries(allRecords)) {
      if(Object.values(record.props).includes(id)) {
        const rAndP = this.getRecordAndParent(Number(recordId));
        if(rAndP) {
          new RecordFactory(rAndP.p).deleteRecord(Number(recordId));
        }
      }
    }
  }

  deleteDeepRecord<T>(idOrAddress: idOrAddress): idAndRecord | undefined {
    const rAndP = this.getRecordAndParent(idOrAddress);
    if(rAndP === undefined) return undefined;
    return new RecordFactory(rAndP.p).deleteRecord(rAndP.id, rAndP.r.type as RT);
  }

  changeRecordName<N extends RT>(id: number, newName?: string, type?: N): RecordNode<N> | undefined {
    const record = this.getRecord(id, type);
    if (record === undefined) {
      return undefined;
    }
    const defaultName = recordTypeDefinitions[record.type as RT].defaultName;
    if (defaultName === undefined) {
      //This means that this type doesn't use name
      return undefined;
    }
    if (newName === undefined) {
      newName = defaultName;
    }
    const existingNames = <Array<string>>Object.entries(this.getRecordMap(type))
      .filter(idValue => Number(idValue[0]) !== id) //remove the same record itself
      .map(idValue => idValue[1].name) //convert records to names
      .filter(name => name !== undefined); //remove undefined names

    if (existingNames.includes(newName)) {
      record.name = getSafeAndUniqueRecordName(newName, existingNames);
    } else {
      record.name = newName;
    }
    return record;
  }

  changeDeepRecordName<N extends RT>(idOrAddress: idOrAddress, newName?: string): RecordNode<N> | undefined {
    const rAndP = this.getRecordAndParent(idOrAddress);
    if(rAndP === undefined || rAndP.r === undefined) return undefined;
    return new RecordFactory(rAndP.p).changeRecordName(rAndP.id, newName, rAndP.r.type as RT);
  }

  /**
   * Used in drag-drop operations
   * When you remove the ids, you also impact the position. So first come up with the new order numbers
   * Allows moving multiple items at the same time
   * Changes order in place
   *
   * Input:     [  1,   2,   3,   4,   5,   6  ]
   * Positions: [0,   1,   2,   3,   4,   5,  6]
   * Operation: nodeIds: [2,4], position: 5
   * Output: [1, 3, 5, 2, 4, 6]
   * 
   * Initial Ord:  1,   2,   3,   4,   5,   6  ]
   * Final Ord:    1,   5.3, 3,   5.6, 5,   6  ] 
   */
  reorderRecords(type: RT, ids: number[], position: number) {
    const sortedRecords = this.getSortedRecords(type);
    const newOrders = this.getNewOrders(sortedRecords, ids.length, position);
    const recordMap = this.getRecordMap(type);
    let n = 0;
    for(let id of ids) {
      recordMap[id].order = newOrders[n++]
    }
  }

  /** Keeps ids intact */
  moveDeepRecords(source: idOrAddress[], dest: idOrAddress, destPosition?: number): boolean {
    const sourceRAndPArray = source.map(s => this.getRecordAndParent(s));
    const destRAndP = this.getRecordAndParent(dest);
    if(sourceRAndPArray === undefined || destRAndP === undefined) return false;

    //Delete all sources:
    const deletedIdAndRecords: idAndRecord[] = [];
    for(const sourceRAndP of (sourceRAndPArray as rAndP[])) {
      const parentRF = new RecordFactory(sourceRAndP.p);
      const deletedIdAndRecord = parentRF.deleteRecord(sourceRAndP.id, sourceRAndP.r.type as RT);
      if(deletedIdAndRecord !== undefined) {
        deletedIdAndRecords.push(deletedIdAndRecord);
      }
    }

    //Insert deleted records
    //Inserted in reverse order because we keep inserting in the same position.
    //If we don't reverse, a,b,c will get inserted into 1,2,3 as 1,2,3,c,b,a
    for(const idAndRecord of deletedIdAndRecords.reverse()) {
      this.addRecord({
        record: idAndRecord.record, 
        id: idAndRecord.id, 
        position: destPosition, 
        dontCycleSubRecordIds: true,
        parentIdOrAddress: dest,
      })
    }
    return true;
  }

  /** Changes ids */
  copyDeepRecords(source: idOrAddress[], dest: idOrAddress, destPosition?: number): boolean {
    const sourceRAndPArray = source.map(s => this.getRecordAndParent(s));
    const destRAndP = this.getRecordAndParent(dest);
    if(sourceRAndPArray === undefined || destRAndP === undefined) return false;

    //Inserted in reverse order because we keep inserting in the same position.
    //If we don't reverse, a,b,c will get inserted into 1,2,3 as 1,2,3,c,b,a
    for(const rAndP of (sourceRAndPArray as rAndP[]).reverse()) {
      this.addRecord({
        record: rAndP.r,
        position: destPosition,
        parentIdOrAddress: dest,
      })
    }
    return true;
  }

  /**
   * Function to create what gets copied when you type ctrl+c
   */
  copyToClipboard(selectedIdOrAddrs: idOrAddress[]): ClipboardData {
    const nodes: idAndRecord[] = [];
    for(const idOrAddr of selectedIdOrAddrs) {
      const rAndP = this.getRecordAndParent(idOrAddr);
      if(rAndP !== undefined) {
        nodes.push({id: rAndP.id, record: rAndP.r})
      }
    }
    return {nodes};
  }

  pasteFromClipboard(parentIdOrAddr: idOrAddress, clipboardData: ClipboardData, positionInPlace?: number) {
    const parentRecord = this.getDeepRecord(parentIdOrAddr);
    if(parentRecord !== undefined) {
      const parentRF = new RecordFactory(parentRecord);
      for(const node of clipboardData.nodes) {
        parentRF.addRecord({record: node.record, position: positionInPlace});
      }
    }
  }
}

export class RecordUtils {
  static getDefaultValues = <T extends RT>(type: T): Record<string, unknown> => recordTypeDefinitions[type].defaultValues;
}