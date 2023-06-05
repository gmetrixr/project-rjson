export enum ThenActionProperty {
  ta_co_id = "ta_co_id",
  ta_co_type = "ta_co_type",
  action = "action",
  ta_properties = "ta_properties",
  ta_delay = "ta_delay",
}

export const thenActionPropertyDefaults: Record<ThenActionProperty, unknown> = {
  [ThenActionProperty.ta_co_id]: -99,
  [ThenActionProperty.ta_co_type]: "scene",
  /** Of the type rn.RuleAction */
  [ThenActionProperty.action]: "do_nothing",
  /** These are the additional optional properties for the RuleAciton */
  [ThenActionProperty.ta_properties]: [], 
  [ThenActionProperty.ta_delay]: 0,
} 

/**
 * Saved in json.
 * Element Type | Action | [Properties]
 * any | move_to | position element_id, speed
 * any | animate | animation_type, speed
 * object_3d | rotate_by | degrees, speed
 * null | change_scene | scene_id
 */
//  export interface ThenAction {
//   action_id: number;
//   ce_id: number;
//   /** ce_type used by UI to decide what to fill in the remaining boxes */
//   ce_type: CeType;
//   action: ConnectionAction | string;
//   properties?: ArrayOfValues; //Defined as a part of the ThenAction 
//   delay?: number; // default assumed 0
// }

