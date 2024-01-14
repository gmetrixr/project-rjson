import { MIN_SAFE_ORDER_DISTANCE, RecordFactory } from "./RecordFactory.js";
import { RecordMap, RecordNode, rAndP } from "./RecordNode.js";
import { RT, recordTypeDefinitions } from "./RecordTypes.js";

export class RecordUtils {
  static getDefaultValues = <N extends RT>(type: N): Record<string, unknown> => recordTypeDefinitions[type].defaultValues;

  static getRecordEntries <N extends RT>(rm: RecordMap<N>): [number, RecordNode<N>][] {
    return Object.entries(rm)
            .map((entry): [number, RecordNode<RT>] => [Number(entry[0]), entry[1]]);
  }

  static getRecords <N extends RT>(rm: RecordMap<N>): RecordNode<N>[] {
    return Object.values(rm);
  }

  static getRecordIds <N extends RT>(rm: RecordMap<N>): number[] {
    return Object.keys(rm).map(i => Number(i));
  }

  /** ORDERED entries of id, records. Returns ids as strings. */
  static getSortedRecordEntries <N extends RT>(rm: RecordMap<N>): [number, RecordNode<N>][] {
    RecordUtils.ensureOrderKeyPresentOfType(rm);
    const entriesArray = Object.entries(rm);
    //We know that at this point order is not undefined. So we just forcefully cast it to a number.
    const numberEntriesArray = entriesArray
      .sort((a,b) => {return <number>a[1].order - <number>b[1].order})
      .map((entry): [number, RecordNode<RT>] => [Number(entry[0]), entry[1]]);
    return numberEntriesArray;
  }
 
  /** ORDERED ids */
  static getSortedRecordIds <N extends RT>(rm: RecordMap<N>): number[] {
    const entriesArray = RecordUtils.getSortedRecordEntries(rm);
    return entriesArray.map(nodeEntry => nodeEntry[0]);
  }
  
  /** ORDERED records */
  static getSortedRecords <N extends RT>(rm: RecordMap<N>): RecordNode<N>[] {
    const entriesArray = RecordUtils.getSortedRecordEntries(rm);
    return entriesArray.map(nodeEntry => nodeEntry[1]);
  }

  static getDeepRecordAndParentArray(record: RecordNode<RT>, rAndPArray: rAndP[]): rAndP[] {
    for(const [id, r] of new RecordFactory(record).getRecordEntries()) {
      const rAndP: rAndP = {id, p: record, r};
      rAndPArray.push(rAndP);
      this.getDeepRecordAndParentArray(r, rAndPArray);
    }
    return rAndPArray;
  }

  /**
   * Ensures that all records of a given type have the ".order" key in them. 
   * This function finds the max order, and increments the order by 1 for each new entry
   */
  private static ensureOrderKeyPresentOfType(rm: RecordMap<RT>) {
    const valuesArray = Object.values(rm);

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
  static getNewOrders(sortedRecords: RecordNode<RT>[], newRecordsCount: number, position?: number): number[] {
    RecordUtils.ensureMinDistanceOfOrders(sortedRecords);
    const order = [];
    let minOrder = sortedRecords[0]?.order ?? 0;
    let maxOrder = sortedRecords[sortedRecords.length - 1]?.order ?? 0;
    if(sortedRecords.length === 0) { //return [1, 2, 3 ...] //these are the first records being inserted
      for(let i=0; i<newRecordsCount; i++) {
        order[i] = i+1;
      }
    } else if(position === 0) { //insert at beginning
      for(let i=0; i<newRecordsCount; i++) {
        minOrder = minOrder-1;
        order[i] = minOrder;
      }
    } else if(position === sortedRecords.length || position === undefined) { //insert at end
      for(let i=0; i<newRecordsCount; i++) {
        maxOrder = maxOrder+1;
        order[i] = maxOrder;
      }
    } else { //insert somewhere in the middle
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

  /** 
   * In case the difference in order gets dangerously close the JS's Number.MIN_VALUE, reset orders
   * The second argument is optional, and provided only for testing
   */
  private static ensureMinDistanceOfOrders(sortedRecords: RecordNode<RT>[], minSafeOrderDistanceOverride = MIN_SAFE_ORDER_DISTANCE): void {
    //Applicable only if number of records > 2
    if(sortedRecords.length <= 2) return;
    //Get the minimum distance between two order - orders are sorted, so we always do a(n) - a(n-1)
    for(let i=1; i<sortedRecords.length; i++) { //starting at index 1. n-1 subtractions.
      //ensureOrderKeyPresentOfType is already called in getSortedEntries. So we are sure record(n).order always exists.
      const currentDistance = <number>sortedRecords[i].order - <number>sortedRecords[i-1].order;
      if(currentDistance < minSafeOrderDistanceOverride) {
        let order = 1;
        for(const r of sortedRecords) {
          r.order = order++;
        }
        return;
      }
    }
  }
}
