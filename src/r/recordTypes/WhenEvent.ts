// export type WhenEventProperties = Exclude<WhenEventProperty, "event_id">;

/**
 * Save in json.
 * Used for matching in ConnectionsManager
 * WhenEvent is also the definition that gets saved in project json
 * When an event is described, it has an event_id too (just event & ce_id aren't enough for tracking uniqueness)
 */
export enum WhenEventProperty {
  we_co_id = "we_co_id",
  we_co_type = "we_co_type",
  /** Store rn.RuleEvent */
  event = "event",
  /** Stores vn.ArrayOfValues */
  we_properties = "we_properties",
}

export const whenEventPropertyDefaults: Record<WhenEventProperty, unknown> = {
  [WhenEventProperty.we_co_id]: -99,
  [WhenEventProperty.we_co_type]: "scene",
  [WhenEventProperty.event]: "on_load",
  [WhenEventProperty.we_properties]: [],
};

// export interface IWhenEvent {
//   ce_id: number;
//   /** ce_type used by UI to decide what to fill in the remaining boxes. In Partial event, as the element know what it's own type is */
//   ce_type: CeType;
//   //TODO: Fix
//   //event: ConnectionEvent | string;
//   properties?: ArrayOfValues;
// }

