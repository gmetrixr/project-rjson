import { RecordNode, RecordMap, createRecord, ClipboardR, RecordMapGeneric } from "./RecordNode";
import { RT, RTP, recordTypeDefinitions, isRecordType, rtp, isTypeChildOf, isTypeSubChildOf } from "./RecordTypes";
import { jsUtils, stringUtils } from "@gmetrixr/gdash";

const { deepClone, generateIdV2 } = jsUtils;
const { getSafeAndUniqueRecordName } = stringUtils;

type PredicateType<N extends RT> = (value: RecordNode<N>, index?: number, array?: RecordNode<N>[]) => boolean;
/** id: child id, r: child RecordNode, p: parent RecordNode */
type rAndP = {id: number, r: RecordNode<RT>, p: RecordNode<RT> };
type idAndRecord = {id: number, record: RecordNode<RT>};
type idOrAddress = number | string;

/**
 * A convenient Factory class to maninpulate a RecordNode object of any type
 * This class can be extended to provide any recordType specific funcitonality
 *
 * Using arrow functions in Classes has a runtime performance cost. The constructor bloats up.
 * Solution: https://www.typescriptlang.org/docs/handbook/2/classes.html#this-parameters
 * 
 * JSON Structure:
 * 
 * { //RecordNode -> Any recordNode doesn't know what it's id is. The id is defined one level above
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
 *     "varaible": {} //Varaible RecordMap
 *   }
 * }
 * 
 * json -> return full json
 * NAME
 * getName -> name
 * changeRecordNameOfType -> Changes recordName of a given type (lvl 1)
 * PROPS
 * getProps/getAllPossibleProps -> what this json has/what this json can have (based on type)
 * get/set/reset/delete/getValueOrDefault/getDefault -> prop's values
 * changePropertyName -> used during migrations
 * RECORDS
 * getRecordTypes -> list of subrecord types ["scene", "variable"]
 * getRecordMapOfType / getRecordMap -> individual record map / Merged record map of all types
 * getDeepRecordMap -> Merged record map of all types in the whole tree
 * getRecordOfType / getRecord -> get subrecord of a type (lvl 1) / get subrecord of any type (needs just an id, lvl 1)
 * getDeepRecord -> needs just an idOrAddress, returns record from any level
 * SORTED RECORDS
 * getSortedRecordEntriesOfType / getSortedIdsOfType / getSortedRecordsOfType -> Sorting only 
 *    makes sense in a single type (eg: you wont sort variables & scenes)
 * ADDRESS RELATED
 * getAddress -> Get address of a subnode (with optional property suffix)
 * private getRecordAndParentWithId / getRecordAndParentAtAddress -> Find a record and its parent
 * getPropertyAtAddress / updatePropertyAtAddress
 * getRecordAndParent -> Find record with either id or address
 * changeDeepRecordId -> Updates all references to a recordId in the tree and in properties
 * cycleAllRecordIds -> Changes all ids
 * duplicateDeepRecord / deleteDeepRecord
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

  json(this: RecordFactory<T>): RecordNode<T> {
    return this._json;
  }

  getName(this: RecordFactory<T>): string | undefined {
    return this._json.name;
  }

  /** A list of recordNode.props' keys in the json */
  getProps(this: RecordFactory<T>): string[] {
    return Object.keys(this._json.props);
  }
  
  /** 
   * A list of props this RecordType is supposed to have. 
   * This is different from getProps - 
   * getProps tells you what the json has
   * getAllPossibleProps tell you what the json can have
   */
  getAllPossibleProps(this: RecordFactory<T>): string[] {
    return Object.keys(rtp[this._type]);
  }

  /** In case a property isn't defined in the json, this method returns "undefined" */
  get(this: RecordFactory<T>, property: RTP[T]): unknown {
    return this._json.props[property];
  }

  set(this: RecordFactory<T>, property: RTP[T], value: unknown): RecordFactory<T> {
    this._json.props[property] = value;
    return this;
  }

  reset(this: RecordFactory<T>, property: RTP[T]): RecordFactory<T> {
    this._json.props[property] = this.getDefault(property);
    return this;
  }

  delete(this: RecordFactory<T>, property: string): RecordFactory<T> {
    delete (this._json.props)[property as RTP[T]];
    return this;
  }

  /**
   * Returns the value of a property, or it default in case the value isn't defined.
   * In case there is no default defined, it returns "undefined"
   */
  getValueOrDefault(this: RecordFactory<T>, property: RTP[T]): unknown {
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
  getDefault(this: RecordFactory<T>, property: RTP[T]): unknown {
    const defaultValues = recordTypeDefinitions[this._type].defaultValues;
    if (defaultValues[property] === undefined) return undefined;
    return deepClone(defaultValues[property]);
  }

  /** Used mostly for migrations. And so this fn doesn't do type check on property name. */
  changePropertyName(this: RecordFactory<T>, propertyName: string, newPropertyName: string): RecordFactory<T> {
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
  getRecordTypes(this: RecordFactory<T>): RT[] {
    return Object.keys(this._json.records ?? {}) as RT[];
  }
  

  /** Returns all sub records (one-lvl deep) of a single type */
  getRecordMapOfType<N extends RT>(this: RecordFactory<T>, type: N): RecordMap<N> {
    return this._json.records?.[type] ?? {};
  }

  /** Returns all sub records (one-lvl deep) of a all types */
  getRecordMap<RT>(this: RecordFactory<T>): RecordMapGeneric {
    const recordMap: RecordMapGeneric = {};
    if(this._json.records === undefined) return recordMap;
    for (const type of this.getRecordTypes()) {
      const recordMapOfType = this.getRecordMapOfType(type);
      Object.assign(recordMap, recordMapOfType);
    }
    return recordMap;
  }

  /**
   * A flattened record map of all ids and records in a tree, of all types
   * If there are two records with the same id, this function will fail
   */
  getDeepRecordMap(this: RecordFactory<T>): RecordMapGeneric {
    const recordMap: RecordMapGeneric = {};
    const children = this.getRecordMap();
    Object.assign(recordMap, children);
    for(const record of Object.values(children)) {
      const childSubRecords = new RecordFactory(record).getDeepRecordMap();
      Object.assign(recordMap, childSubRecords);
    }
    return recordMap;
  }

  getRecordOfType<N extends RT>(this: RecordFactory<T>, type: N, id: number): RecordNode<N> | undefined {
    return (this._json.records?.[type] as RecordMap<N>)?.[id];
  }

  getRecord(this: RecordFactory<T>, id: number): RecordNode<RT> | undefined {
    return this.getRecordMap()[id];
  }

  getDeepRecord(this: RecordFactory<T>, idOrAddress: idOrAddress): RecordNode<RT> | undefined {
    if(typeof idOrAddress === "number") {
      return this.getDeepRecordMap()[idOrAddress];
    } else {
      return this.getRecordAndParentAtAddress(idOrAddress)?.r;
    }
  }

  /**
   * Ensures that all records of a given type have the ".order" key in them. 
   * This function finds the max order, and increments the order by 1 for each new entry
   */
  private ensureOrderKeyPresentOfType(this: RecordFactory<T>, type: RT) {
    const valuesArray = Object.values(this.getRecordMapOfType(type));

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
  getSortedRecordEntriesOfType(this: RecordFactory<T>, type: RT): [number, RecordNode<RT>][] {
    this.ensureOrderKeyPresentOfType(type);
    const entriesArray = Object.entries(this.getRecordMapOfType(type));
    //We know that at this point order is not undefined. So we just forcefully cast it to a number.
    const numberEntriesArray = entriesArray
      .sort((a,b) => {return <number>a[1].order - <number>b[1].order})
      .map((entry): [number, RecordNode<RT>] => [Number(entry[0]), entry[1]]);
    return numberEntriesArray;
  }

  /** ORDERED ids */
  getSortedRecordIdsOfType(this: RecordFactory<T>, type: RT): number[] {
    const entriesArray = this.getSortedRecordEntriesOfType(type);
    return entriesArray.map(nodeEntry => nodeEntry[0]);
  }

  /** ORDERED records */
  getSortedRecordsOfType<N extends RT>(this: RecordFactory<T>, type: N): RecordNode<N>[] {
    const entriesArray = this.getSortedRecordEntriesOfType(type);
    return entriesArray.map(nodeEntry => nodeEntry[1]);
  }

  changeRecordNameOfType<N extends RT>(this: RecordFactory<T>, type: N, id: number, newName?: string): RecordNode<N> | undefined {
    const record = this.getRecordOfType(type, id);
    if (record === undefined) {
      return undefined;
    }
    const defaultName = recordTypeDefinitions[type].defaultName;
    if (defaultName === undefined) {
      //This means that this type doesn't use name
      return undefined;
    }
    if (newName === undefined) {
      newName = defaultName;
    }
    const existingNames = <Array<string>>Object.entries(this.getRecordMapOfType(type))
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

  /** Find a record and its parent given any record id */
  private getRecordAndParentWithId<N extends RT>(this: RecordFactory<T>, id: number): rAndP | undefined {
    for (const type of this.getRecordTypes()) {
      const recordMap = this.getRecordMapOfType(type);
      for(const [key, value] of Object.entries(recordMap)) {
        //In case this is the record whose id is to be changed, change it
        if(id === Number(key)) {
          //Found it!!! return the cAndP object
          const rAndP: rAndP = {p: this._json, r: recordMap[id], id: id};
          return rAndP;
        }
        const subRecord = new RecordFactory(value).getRecordAndParentWithId(id);
        if(subRecord !== undefined) {
          return subRecord;
        }
      }
    }
  }

  /**
   * Generate an address like scene:1|element:2 for any child RecordNode
   * RFC: https://docs.google.com/document/d/1DVM_i_Go5iX5-EShV5FikfI29k8YEC9cAjzeAY49blc/edit#
   * Eg 1. scene:1|element:2!opacity
   * Eg 2. scene:1|element:2!wh>1
   * If property is given, it adds property suffix
   * If selfAddr is given (from root), it prefixes that to the address, otherwise returns a partial child address
   */
  getAddress<N extends RT>(this: RecordFactory<T>, {id, type, selfAddr, property, index}: {
    id: number, type?: N, selfAddr?: string, property?: RTP[T], index?: number
  }): string {
    //If record isn't present, return;
    const record = type ? this.getRecordOfType(type, id) : this.getRecord(id);
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

  /**
   * Find the record and its parent with a given address. Searches only in child record nodes.
   * Examples
   * 1. scene:1
   * 2. scene:1|element:2
   * 3. scene:1|element:2!opacity
   * 4. scene:1|element:2!wh>1
   */
  private getRecordAndParentAtAddress(this: RecordFactory<T>, addr: string): rAndP | undefined {
    // Sanitize and remove and unwanted cases
    // Replace everything after a ! with a blank string
    const recordsArray = addr.replace(/!.*/, "").split("|"); // [scene:1, element:2]
    if(recordsArray.length === 0 || this._json.records === undefined) {
      return undefined;
    }
    let parentRF: RecordFactory<RT> = this;
    let childRF: RecordFactory<RT> = this;
    let childId = 0;
    for (let i = 0; i < recordsArray.length; i++) {
      parentRF = childRF;
      const [type, id] = recordsArray[i].split(":"); // [scene, 1]
      const childR = parentRF.getRecordOfType(type as RT, Number(id));
      if(childR === undefined) return undefined;
      childRF = new RecordFactory(childR);
      childId = Number(id);
    }
    const rAndP: rAndP = { id: childId, r: childRF._json, p: parentRF?._json, };
    return rAndP;
  }
  
  /**
   * Given an address like scene:1|element:2!wh>1, get its value
   * If it doesn't find a value, return undefined
   */
  getPropertyAtAddress(this: RecordFactory<T>, addr: string): unknown {
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
  updatePropertyAtAddress(this: RecordFactory<T>, addr: string, value: unknown): boolean {
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
  changeDeepRecordId(this: RecordFactory<T>, id: number, newId?: number): number {
    if (newId === undefined) newId = generateIdV2();

    for (const type of this.getRecordTypes()) {
      const recordMap = this.getRecordMapOfType(type);
      for(const [key, value] of Object.entries(recordMap)) {
        //In case this is the record whose id is to be changed, change it
        if(id === Number(key)) {
          recordMap[newId] = recordMap[id];
          delete recordMap[id];
        }
        //Change all property values that refer to the older id also
        for(const prop of this.getProps()) {
          if(this._json.props[(prop as RTP[T])] === id) {
            this._json.props[(prop as RTP[T])] = newId;
          }
        }
        //Go deeper and change all references in sub-records also (and check if the id exists deeper also)
        new RecordFactory(value).changeDeepRecordId(id, newId);
      }
    }
    return newId;
  }

  /** Change all record ids (of sub-records) in this RecordNode */
  cycleAllRecordIds(this: RecordFactory<T>): void {
    //Get all record ids
    const allRecordsMap = this.getDeepRecordMap();
    for(const key of Object.keys(allRecordsMap)) {
      this.changeDeepRecordId(Number(key));
    }
  }

  getRecordAndParent(this: RecordFactory<T>, idOrAddress: idOrAddress): rAndP | undefined {
    if(typeof idOrAddress === "number") {
      return this.getRecordAndParentWithId(idOrAddress);
    } else {
      return this.getRecordAndParentAtAddress(idOrAddress);
    }
  }

  changeDeepRecordName<N extends RT>(this: RecordFactory<T>, idOrAddress: idOrAddress, newName?: string): RecordNode<N> | undefined {
    const rAndP = this.getRecordAndParent(idOrAddress);
    if(rAndP === undefined || rAndP.r === undefined) return undefined;
    return new RecordFactory(rAndP.r).changeRecordNameOfType(rAndP.r.type as RT, rAndP.id, newName);
  }

  addBlankRecord<N extends RT>(this: RecordFactory<T>, type: N, position?: number):{id: number, record: RecordNode<N>} | undefined {
    const record = createRecord(type);
    return this.addRecord(record, position);
  }
  
  /**
   * Adding ".order" key to the new entry - even if the record already had a .order, we will overwrite it
   * potential value of respective orders: [4, 4.5, 4.75, 5, 8]
   * meaning of "position" - the [gap] to insert into: [0] 0, [1] 1, [2] 2, [3] 3, [4] 4 [5]
   * if this is the only record, order = 1
   * if its inserted at [0], order = order of the first entry - 1
   * if its inserted at [5], order = order of the last entry + 1 (default, when position is undefined)
   * if its inserted at [x], order = ( order of [x - 1] entry + order of [x] entry ) / 2 
   */
  private getNewOrder<N extends RT>(this: RecordFactory<T>, sortedRecords: RecordNode<T>[], position?: number): number {
    let order = 0;
    const minOrder = sortedRecords[0]?.order ?? 0;
    const maxOrder = sortedRecords[sortedRecords.length - 1]?.order ?? 0;
    if(sortedRecords.length === 0) {
      order = 1;
    } else if(position === 0) {
      order = minOrder - 1;
    } else if(position === sortedRecords.length || position === undefined) {
      order = maxOrder + 1;
    } else {
      const prevOrder = sortedRecords[position - 1].order ?? 0;
      const nextOrder = sortedRecords[position].order ?? 0;
      order = (prevOrder + nextOrder) / 2;
    }
    return order;
  }

  private initializeRecordMap(this: RecordFactory<T>, type:RT): boolean {
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
  addRecord<N extends RT>(this: RecordFactory<T>, record: RecordNode<N>, position?: number): {id: number, record: RecordNode<N>} | undefined {
    const type = <RT> record.type;
    if(!this.initializeRecordMap(type)) return undefined;
    const recordMap = this.getRecordMapOfType(type);
    const recordsArray = this.getSortedRecordsOfType(type);
    record.order = this.getNewOrder(recordsArray, position);
    //Cycle all ids in the new record being added so that there are no id clashes
    new RecordFactory(record).cycleAllRecordIds();

    const id = generateIdV2();
    recordMap[id] = record;
    //This fn make sure that the name isn't a duplicate one, and also that its given only if its required
    this.changeRecordNameOfType(type, id, record.name);
    return {id, record};
  }

  duplicateRecord<N extends RT>(this: RecordFactory<T>, id: number): idAndRecord | undefined {
    const orig = this.getRecord(id);
    if (orig === undefined) return undefined;
    const clonedJson = deepClone(orig);

    //get the next record
    const ids = this.getSortedRecordIdsOfType(<RT> orig.type);
    const origPositionIndex = ids.indexOf(id);

    //addRecord makes sure that the id of the record itself isn't duplicate amongst its siblings
    //Also makes sure that the cloneJson.order is correct
    return this.addRecord<N>(clonedJson, origPositionIndex + 1);
  }

  duplicateDeepRecord<T>(this: RecordFactory<RT>, idOrAddress: idOrAddress): rAndP | undefined {
    const rAndP = this.getRecordAndParent(idOrAddress);
    if(rAndP === undefined) return undefined;
    const duplicatedIdAndRecord = new RecordFactory(rAndP.p).duplicateRecord(rAndP.id);
    if(duplicatedIdAndRecord === undefined) return undefined;
    rAndP.id = duplicatedIdAndRecord?.id;
    rAndP.r = duplicatedIdAndRecord.record;
    return rAndP;
  }

  deleteDeepRecord<T>(this: RecordFactory<RT>, idOrAddress: idOrAddress): idAndRecord | undefined {
    const rAndP = this.getRecordAndParent(idOrAddress);
    if(rAndP === undefined) return undefined;

    const recordToDelete = rAndP.r;
    const parentRecordMapOfType = new RecordFactory(rAndP.p).getRecordMapOfType(recordToDelete.type as RT);
    delete parentRecordMapOfType[rAndP.id];
    return {id: rAndP.id, record: recordToDelete};
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
  moveRecords(this: RecordFactory<T>, type: RT, ids: number[], position: number): undefined {
    const recordMap = this.getRecordMapOfType(type);
    if (recordMap === undefined) { return; }
    if (ids.length === 0) { return; }
    const records = ids.map(id => recordMap[id]);
    //Get the list of ids in order
    const allIds = this.getSortedRecordIdsOfType(type);

    //When you remove the ids, you also impact the position. So first come up with the new order numbers
    //if position is the last one, keep incrementing the last order by 1
    //if position is the first one, keep decrementing the first order by 1
    //if position is somewhere in the middle, take the prior and next order, and divide it equally
    if(position === allIds.length) {
      let maxOrder = recordMap[allIds[allIds.length - 1]].order ?? 0;
      for(const record of records) {
        maxOrder += 1;
        record.order = maxOrder;
      }
    } else if (position === 0) {
      let minOrder = recordMap[0].order ?? 0;
      const reversedRecords = records.reverse();
      for(const record of reversedRecords) {
        minOrder -= 1;
        record.order = minOrder;
      }
    } else {
      const previousRecordOrder = recordMap[allIds[position - 1]].order ?? 0;
      const nextRecordOrder = recordMap[allIds[position]].order ?? 0;
      let segment = 0;
      for(const record of records) {
        segment += 1;
        //Previous entry : 4.1, next entry 4.5. Trying to insert 3 items at 4.2, 4.3 and 4.4
        // 4.1 + (4.5-4.1) / 4 * segment
        record.order = previousRecordOrder + (nextRecordOrder - previousRecordOrder) / (records.length + 1) * segment;
      }
    }
  }

  /**
   * Documentation for filter predicate: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter#description
   * //TODO: Update logic to use getDeepRecordMap and run predicate on each of those
   */
  getAllDeepChildrenIdsWithFilter<N extends RT>(this: RecordFactory<T>, type: N, predicate: PredicateType<N>): number[] {
    const idsToReturn: number[] = [];
    if (this._json.records === undefined) return idsToReturn;
    for (const recordType of (Object.keys(this._json.records) as RT[])) {
      if (recordType === type) {
        //The order needs to be same as above. So not using getRecords()
        const records = Object.values(this.getRecordMapOfType(type));
        const ids = Object.keys(this.getRecordMapOfType(type));
        for(let i = 0; i < records.length; i++) {
          if(predicate(records[i], i, records)) {
            idsToReturn.push(Number(ids[i]));
          }
        }
      }
      if (!isTypeSubChildOf(this._type, type)) {
        continue;
      }
      for (const record of this.getSortedRecordsOfType(recordType)) { //Go a level deeper if available
        const recordDeepChildrenIds = new RecordFactory(record).getAllDeepChildrenIdsWithFilter(type, predicate);
        idsToReturn.push(...recordDeepChildrenIds);
      }
    }
    return idsToReturn;
  }

  /**
   * //TODO: Update logic to use getDeepRecordMap and run predicate on each of those
   */
  getAllDeepChildrenWithFilter<N extends RT>(this: RecordFactory<T>, type: N, predicate: PredicateType<N>): RecordNode<N>[] {
    const recordsToReturn: RecordNode<N>[] = [];
    if (this._json.records === undefined) return recordsToReturn;
    for (const recordType of (Object.keys(this._json.records) as RT[])) {
      if (recordType === type) {
        recordsToReturn.push(...this.getSortedRecordsOfType(recordType).filter(predicate));
      }
      if (!isTypeSubChildOf(this._type, type)) {
        continue;
      }
      for (const record of this.getSortedRecordsOfType(recordType)) {
        const recordDeepChildren = new RecordFactory(record).getAllDeepChildrenWithFilter(type, predicate);
        recordsToReturn.push(...recordDeepChildren);
      }
    }
    return recordsToReturn;
  }

  /**
   * TODO
   * Add moveRecords in RecordFactory. ProjectFactory will override this to add rules logic.
   * moveRecords(selectIds: [{id: , path: [recordId, parentRecordId, parent2RecordId....]}], destiation: {id: ,path: []}, destinationPosition)
   */


  /**
   * Function to create what gets copied when you type ctrl+c
   */
  copySelectionToClipboard(this: RecordFactory<T>, selectedAddresses: string[]): ClipboardR {
    const nodes: RecordNode<RT>[] = [];
    for(const addr of selectedAddresses) {
      const node = this.getDeepRecord(addr);
      if(node !== undefined)
      nodes.push(node);
    }
    return {nodes};
  }

  pasteSelectionFromClipboard(this: RecordFactory<T>, parentAddress: string, clipboardEntry: ClipboardR, positionInPlace: number) {
    const parentNode = this.getDeepRecord(parentAddress);
    if(parentNode !== undefined) {
      const parentF = new RecordFactory(parentNode);
      for(const node of clipboardEntry.nodes) {
        parentF.addRecord(node, positionInPlace);
      }
    }
  }

  /**
   * Keeps ids intact
   */
  moveDeepRecordsToAddress(this: RecordFactory<T>, sourceRecordAddresses: string[], destParentAddr: string, destPosition?: number) {
    const destParentRecord = this.getDeepRecord(destParentAddr);
    if(destParentRecord === undefined) return;

    const rAndPArray = sourceRecordAddresses.map(addr => this.getRecordAndParentAtAddress(addr));
    const deletedRecordEntries: {id: number, record: RecordNode<RT>}[] = [];
    for(const sourceRAndP of rAndPArray) {
      if (sourceRAndP?.p !== undefined) {
        const deletedRecordEntry = new RecordFactory(sourceRAndP?.p).deleteRecord(sourceRAndP.id);
        if(deletedRecordEntry !== undefined) {
          deletedRecordEntries.push(deletedRecordEntry)
        }
      }
    }
    const parentF = new RecordFactory(destParentRecord);
    for(const recordEntry of deletedRecordEntries.reverse()) {
      const addedRecord = parentF.addRecord(recordEntry.record, destPosition);
      if(addedRecord !== undefined) {
        const {id, record} = addedRecord;
        //Try to keep id the same so rules don't break
        parentF.changeDeepRecordId(id, recordEntry.id);
      }
    }
  }

  /**
   * Created new ids of the records created
   */
  copyDeepRecordsToAddress(this: RecordFactory<T>, sourceRecordAddresses: string[], destParentAddr: string, destPosition?: number) {
    const destParentRecord = this.getDeepRecord(destParentAddr);
    if(destParentRecord === undefined) return;

    const copiedRecords = sourceRecordAddresses.map(addr => this.getDeepRecord(addr));
    const parentF = new RecordFactory(destParentRecord);
    for(const copiedRecord of copiedRecords.reverse()) {
      if(copiedRecord !== undefined) {
        parentF.addRecord(copiedRecord, destPosition);
      }
    }
  }

  /**
   * Change all inner ids, and their references (values) in properties if any
   * Useful when you are copying an element folder / group for example - when you don't want any duplication
   * of ids when copy pasting
   * Elements at different depths can refer to each other.
   * So that's why, we first need to go to every record and make a list (and not change while going to every record)
   * and only then change all record ids one by one
   */
  cycleInnerIds(this: RecordFactory<T>) {
    //Go to every inner id recursively
    const allRecords = this.getDeepRecordMap();
    for(const [id, record] of Object.entries(allRecords)) {
      
    }
    //Keep replacing them one by one in the whole tree

  }

  /** 
   * Returns the object that needs to be stringified before sending to clipboard
   * Needs to be overriden at Project/Scene level to ensure that 
   * 1) Vars are copied correctly (in case of scene copy). Vars pasting will be a bit different - no point changing ids.
   * 2) element ids don't conflict at any depth while pasting
   * 3) To ensure Ctrl+V of scene works even within another scene (ie project's paste gets used)
   *
   * * For clipboard operation, this function can only be called at the parent level
   * * For scene copy, call to r.project()
   * * For element copy, call to r.scene()
   *
   * Scene copy logic:
   * In scene rules, vars can be referenced via ids or via variable names (in templates used in elements)
   * Copy all variables referenced.
   * 
   * Scene paste logic:
   * For EACH variable which was copied
   * - If the variable id and name doesn't exist - paste it
   * - If the variable id exists, but name doesn't - ignore it. (To make this work, we need to go to each string template used in rules
   * and elements in the new scene, and change the templates to use the new name)
   * - If the variable id doesn't exist, but name does - replace the variable id in the new scene being pasted (in all rules)
   * with the new variable id
   * - If both the variable id and name exist - ignore it
   */
  //SHOULD MAKE THIS WORK WITH ADDRESSES INSTEAD OF IDS
  // copyToClipboardObject(this: RecordFactory<T>, ids: number[]): ClipboardR {
  //   //Keep searching for children until we get the same id
  //   const romTypes = this.getROMTypes();
  //   const foundRecordNodes: RecordNode<RT>[] = [];
  //   for(const romType of romTypes) {
  //     foundRecordNodes.push(...this.getAllDeepChildrenWithFilter(romType, (value => ids.includes(value.id))));
  //   }
  //   return {
  //     parentType: this._type,
  //     nodes: foundRecordNodes,
  //   }
  // }
  
  /** 
   * Once the clipboard has been converted into ClipboardR, this function can be used to merge into parent RecordNode 
   */
  // pasteFromClipboardObject(this: RecordFactory<T>, { obj, position }: {obj: ClipboardR, position?: number}): void {
  //   if(obj.parentType !== this._type) {
  //     console.error(`Can't paste this object into a RecordNode of type of ${this._type}`);
  //     return;
  //   }
  //   for(const rn of obj.nodes) {
  //     // * if position is passed, then keep incrementing to insert in order, else add at the end of the list
  //     this.addRecord(rn, position? position++: position);
  //   }
  // }




  /**
   * This allows re-parenting records between different depths inside a tree using their addresses.
   * This needs to be called for the record where both sourceParentRecord and destParentRecord are child records of a common super parent record
   * For almost all operations, we will use a top down approach here for re-parenting, i.e re-parenting process needs to start from the top most parent
   * in this case, it is almost always project
   * Example1: moving elements from within a group to 1 level above.
   *
   * Scene1
   *  Element1 <-------|
   *  Element2         |
   *  Element3 (group) |
   *    Element31 -----|
   *    Element32
   *
   * In above scenario we want to move Element31 below Element1
   * sourceRecordAddr = [{parentAddr: Scene:1|Element:3, recordAddr: Scene:1|Element:3|Element:31}]
   * destParentAddr = Scene:1
   * destPosition = 0 (we insert at x+1 index)
   *
   * Example2: moving elements from one scene to another
   *
   * Scene1
   *  Element1
   *  Element2
   *  Element3 (group)
   *    Element31
   *    Element32  <-|
   * Scene2          |
   *  Element4 ------|
   *  Element5
   *
   * In above scenario we want to move Element4 from Scene2 to Element3(Group)
   * sourceRecordAddr = [{parentAddr: Scene:2, recordAddr: Scene:2|Element:4}]
   * destParentAddr = Scene:1|Element:3
   * destPosition = 1 (we insert at x+1 index)
   *
   */
  // reParentRecordsWithAddress(destParentAddr: string, sourceRecordAddr: string[], destPosition?: number): [RecordNode<RT>[], RecordNode<RT>[]] {
  //   const destParentRecord = this.getRecordAtAddress(destParentAddr);
  //   const reParentedRecords: RecordNode<RT>[] = [];
  //   const failedReParentedRecords: RecordNode<RT>[] = [];
  //   if(destParentRecord === null) {
  //     console.error(`[reParentRecordsWithAddress]: Error in re-parenting. destParentAddr: ${destParentAddr}`);
  //     return [reParentedRecords, failedReParentedRecords];
  //   }

  //   const destinationParentRecordF = new RecordFactory(destParentRecord);
  //   for(const s of sourceRecordAddr) {
  //     const parentAndChild = this.getRecordAndParentAtAddress(s);
  //     if(parentAndChild === null || parentAndChild.p === undefined) {
  //       console.error(`[delete-sourceRecordAddresses]: can't find record/parent for : recordAddr: ${s}`);
  //       continue;
  //     }
  //     const { p: sourceParentRecord, c: sourceRecord, cid: sourceRecordId } = parentAndChild;

  //     /**
  //      * The order of operations here is very important
  //      * 1. add the record in the new parent
  //      * 2. delete the record from older parent
  //      *
  //      * We do this in this order and not reverse since there can be records that don't qualify to be child of a parent
  //      * for ex: a scene can't be a child of a group
  //      * in this case, we don't re-parent the record at all and addRecord function returns undefined.
  //      * A better UX for this would be to restrict the user to be able to do that at all in the UI
  //      */

  //     // * Add to destination parent
  //     // * addRecord takes care of name clashes and id clashes
  //     const addedRecord = destinationParentRecordF.addRecord(sourceRecord, destPosition);
  //     // * Record was added correctly to the appropriate parent
  //     if(addedRecord !== undefined) {
  //       // * delete the record from resp parents
  //       const sourceParentRecordF = new RecordFactory(sourceParentRecord);
  //       sourceParentRecordF.deleteRecord(sourceRecord.type as RT, sourceRecordId);
  //       reParentedRecords.push(addedRecord);
  //     } else {
  //       failedReParentedRecords.push(sourceRecord);
  //     }
  //   }
  //   return [reParentedRecords, failedReParentedRecords];
  // }

  // /**
  //  * This returns all the nodes in the path from a parent to a leaf
  //  */
  // getBreadcrumbs(this: RecordFactory<T>, id: number, type: RT): RecordNode<RT>[] {
  //   const recordsToReturn: RecordNode<RT>[] = [];
  //   const deepCAndP = this.getDeepChildAndParent(type, id);
  //   if(deepCAndP === undefined) {
  //     recordsToReturn.push(this.json());
  //     return recordsToReturn;
  //   }

  //   // we've reached the parent
  //   if(deepCAndP.p.id === this.getId() && deepCAndP.p.type === this._type) {
  //     recordsToReturn.push(deepCAndP.p);
  //     recordsToReturn.push(deepCAndP.c);
  //   } else {
  //     // this is a different parent, lets find it's parent
  //     recordsToReturn.push(...this.getBreadcrumbs(deepCAndP.p.id, deepCAndP.p.type as RT));
  //     recordsToReturn.push(deepCAndP.c);
  //   }

  //   return recordsToReturn;
  // }

  // /**
  //  * Get address for a deep record
  //  */
  // getDeepRecordAddress(this: RecordFactory<T>, { id, type, parentAddr }: { id: number, type: RT, parentAddr?: string }): string {
  //   const breadcrumbs = this.getBreadcrumbs(id, type);
  //   let address = "";
  //   for (let i = 0; i < breadcrumbs.length; i++) {
  //     const b = breadcrumbs[i];
  //     address += `${b.type}:${b.id}`;
  //     // if this isnt the last entry, then append `|`
  //     if (i !== breadcrumbs.length - 1) {
  //       address += "|";
  //     }
  //   }
  //   return parentAddr ? `${parentAddr}|${address}` : address;
  // }

  // /**
  //  * Get record + parent address for a given record
  //  */
  // getDeepChildAndParentAddress(this: RecordFactory<T>, id: number, type: RT): string[] | undefined {
  //   const deepChildAndParent = this.getDeepChildAndParent(type, id);
  //   if(deepChildAndParent === undefined) {
  //     return undefined;
  //   }
  //   const recordAddress = this.getDeepRecordAddress({ id, type });
  //   const parentAddress = this.getDeepRecordAddress({ id: deepChildAndParent.p.id, type: deepChildAndParent.p.type as RT });

  //   return [recordAddress, parentAddress];
  // }
}

export class RecordUtils {
  static getDefaultValues = <T extends RT>(type: T): Record<string, unknown> => recordTypeDefinitions[type].defaultValues;
}
