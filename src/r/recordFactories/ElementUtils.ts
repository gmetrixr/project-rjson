import { eTypeToDefn } from "../definitions/elements/index.js";
import { BasicElement, ElementType, IElementDefinition } from "../definitions/elements/ElementDefinition.js";
import { RT, recordTypeDefinitions } from "../R/RecordTypes.js";
import { fn } from "../definitions/index.js";

export class ElementUtils {
  /**
   * Get the element definition of a specific element_type
   * ElementDefinition can be used to get element_type, properties, propertyDefaults, events, actions
   * 
   * In case its an unknown element_type, returns BasicElement's Definition
   */
  static getElementDefinition = (elementType: ElementType): IElementDefinition => {
    const defn = eTypeToDefn[elementType];
    if(defn !== undefined) {
      return defn;
    } else {
      return BasicElement;
    }
  }

  /** Get a list of all defaults for the given elementType */
  static getElementTypeDefaults = (elementType: ElementType): Record<string, unknown> => {
    const allElementDefaults = recordTypeDefinitions[RT.element].defaultValues;
    const elementOverrides = eTypeToDefn[elementType]?.defaultOverrides ?? {};
    const props = eTypeToDefn[elementType]?.properties ?? [];
    const defaultValues: Record<string, unknown> = {};
    for(const prop of props) {
      let value = elementOverrides[prop];
      if(value === undefined) value = allElementDefaults[prop];
      defaultValues[prop] = value;
    }
    return defaultValues;
  }

  /**
   * Given a property of type Array<Source>, takes file id out of it in an array and returns it
   */
    static getFileIdsFromElementArrayPropertyValue = (value: unknown): number[] => {
      if(value === undefined) return [];
      const imageSources = <fn.Source[]> value;
      return imageSources.map(source => source?.id).filter(s => s); // filter out undefined and null values
    } 

 /**
  * Given a property value (of type source), takes file id out of it and returns it as an array
  */
  static getFileIdsFromValue = (value: unknown): number[] => {
    const source = <fn.Source> value;
    if(source?.id !== undefined) { //Because we don't want to return default source paths which don't have ids
      return [source?.id];
    } else {
      return [];
    }
  }

  /**
   * Given a property value and sourceMap, returns a new value with the replaced sources
   * Can return undefined or a Source or a Source[], depending on the propertyName
   * The multiple returns type don't matter, because the logic of the calling function doesn't care about return type
   */
  static getNewSourceValueArray = (value: unknown, sourceMap: {[id: number]: fn.Source}): fn.Source[] => {
    if(value === undefined) return [];
    const originalSources = <fn.Source[]> value;
    return originalSources.map(source => sourceMap[source?.id]);
  }

  static getNewSourceValue = (value: unknown, sourceMap: {[id: number]: fn.Source}): fn.Source | undefined => {
    const source = <fn.Source> value;
    if(source?.id !== undefined && sourceMap[source?.id] !== undefined) { //Because we don't want to return default source paths which don't have ids
      return sourceMap[source?.id];
    } else {
      return undefined;
    }
  }
}
