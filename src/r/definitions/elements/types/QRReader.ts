import { BasicElement, ElementType,  IElementDefinition } from "../ElementDefinition";

export const QRReader: IElementDefinition = {
  element_type: ElementType.qrcode_browser,
  elementDefaultName: "QR Browser",
  properties: [
    ...BasicElement.properties,
  ],
  defaultOverrides: {},
  events: [ ],
  actions: [ ...BasicElement.actions ]
}
