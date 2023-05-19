/**
 * Command pattern
 */
export interface IOrder {
  execute: (projectJson: any) => void,
}
