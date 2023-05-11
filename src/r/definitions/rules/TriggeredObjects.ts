import { ArrayOfValues } from "../variables";
import { RuleAction } from "./RuleAction";
import { RuleEvent } from "./RuleEvent";

/**
 * For timer, properties are timermatch
 * When element_id = SCENE_ELEMENT_ID, implies scene level event
 * TriggeredEvent is what is sent by the cog to the gear on any event (like on_click)
 */
 export interface TriggeredEvent {
  /**
   * We generally match a triggered event to its WhenEvents(s) using just co_id + event. 
   * However in the case of rareEvents, event_id becomes important - as there's no way to match a WhenEvent uniquely just by co_id + event anymore.
   * This is because whenEvent.properties can have any value in it (Eg: When var_a > 5, and it gets trigerred with a value of 6).
   * In such cases, event_id is needed to get the whenEvent.properties, and we use co_id + event + properties.join("") as the identifier instead.
   */
  event_id?: number;
  /** co_id + event (+ properties) are used as the identifier to uniquely match TriggeredEvent with WhenEvent(s) */
  co_id: number;
  event: RuleEvent;
  values: ArrayOfValues;
  /** Used to undo an event in case event was already triggered (denotes that the condition for the event is no longer true) */
  negation: boolean;
  /** 
   * Flash events are those event which "Flash out". i.e. just an instant after they are triggered, they negate too. Eg: a click.
   * A "click" is "true" only for one instant of time.
   * They negation bit is handled automatically by gears
   */
  flash: boolean;
  timestamp: number;
}

export interface TriggeredAction {
  /** 
   * co_id needed here to be able to detect which var needs to change (as all vars share the same cog).
   * This property is optional because there wont be any co_id in case of a broadcasted TriggeredAction.
   */
  co_id?: number;
  action: RuleAction;
  properties: ArrayOfValues;
  /** Used to pass values to the element from the TriggeredEvent */
  values: ArrayOfValues;
}
