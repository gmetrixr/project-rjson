import { eTypeToDefn } from "../definitions/elements";
import { BasicElement, ElementType, IElementDefinition, isElementType } from "../definitions/elements/ElementDefinition";
import { RecordFactory } from "../R/RecordFactory";
import { createRecord, RecordNode } from "../R/RecordNode";
import { RT, recordTypeDefinitions, RTP, rtp } from "../R/RecordTypes";
import { en, fn } from "../definitions";
import { jsUtils } from "@gmetrixr/gdash";

const deepClone = jsUtils.deepClone;

export class ElementFactory extends RecordFactory<RT.element> {
  private elementType: ElementType;

  constructor(json: RecordNode<RT.element>) {
    super(json);
    const element_type = json.props.element_type as string;
    if(element_type !== undefined && isElementType(element_type)) {
      this.elementType = element_type;
    } else {
      throw Error(`The type ${element_type} of this ElementJson isn't a known ElementType`);
    }
  }

  getElementType(): ElementType {
    return this.elementType;
  }

  /** Override so that updating element_type prop updates this instance's elementType property */
  set(property: RTP[RT.element], value: unknown): ElementFactory {
    super.set(property, value);
    if(property === rtp.element.element_type && (typeof value === "string") && isElementType(value)) {
      this.elementType = value;
    }
    return this;
  }

  /**
   * Returns the default value of a property. If no default is found, returns undefined
   * This is already defined in RecordFactory and is being overridden in ElementFactory
   */
  getDefault(property: RTP[RT.element]): unknown {
    const elementDefaultValues = eTypeToDefn[this.elementType]?.defaultOverrides ?? {};
    if(elementDefaultValues[property] !== undefined) return deepClone(elementDefaultValues[property]);
    const defaultValues = recordTypeDefinitions[RT.element].defaultValues;
    if(defaultValues[property] !== undefined) return deepClone(defaultValues[property]);
  }

  //ELEMENT RELATED FUNCTIONS
  /**
   * Used by the right bar to list down properties
   */
  getJsonPropsAndDefaultProps(): string[] {
    const jsonProps = this.getProps();
    const elementProps = ElementUtils.getElementDefinition(this.elementType).properties;
    return Array.from(new Set(jsonProps.concat(elementProps)));
  }

  //FILE RELATED FUNCTIONS
  /** 
   * Gets all file ids from an element structure
   * file ids are stored in properties of type "source"
   * Properties of type "source" are generally in properties ending with "source" (Eg: "background_source")
   * sources
   */
  getFileIdsFromElement (): number[] {
    const fileIds: number[] = [];
    const elementProps = this.getJsonPropsAndDefaultProps();
    //Get file ids form element properties
    for(const sourceProp of en.sourcePropertyNames.elementProperties) { //Iterating over sourceElementProperties instead of elementProps to reduce number of iterations
      if(elementProps.includes(sourceProp)) {
        fileIds.push(...ElementUtils.getFileIdsFromValue(this.get(sourceProp)));
      }
    }
    //Get file ids form element array properties
    for(const sourceProp of en.sourcePropertyNames.elementArrayProperties) {
      if(elementProps.includes(sourceProp)) {
        fileIds.push(...ElementUtils.getFileIdsFromElementArrayPropertyValue(this.get(sourceProp)));
      }
    }
    //Get file ids from item properties
    for(const sourceProp of en.sourcePropertyNames.itemProperties) {
      for(const item of Object.values(this.getRecordMap(RT.item))) {
        const itemProps = Object.keys(item.props);
        if(itemProps.includes(sourceProp)) { //Not checking for image_source, as it isn't used in items
          fileIds.push(...ElementUtils.getFileIdsFromValue(item.props[sourceProp]));
        }
      }
    }
    
    //return _.uniq(fileIds); Unique not needed here, done at project level
    return fileIds;
  }

  /** 
   * Inject the given sources into the element
   */
  injectSourceIntoElement (sourceMap: {[id: number]: fn.Source}): void {
    const elementProps = this.getJsonPropsAndDefaultProps();
    //Get file ids form element properties
    for(const sourceProp of en.sourcePropertyNames.elementProperties) { //Iterating over sourceElementProperties instead of elementProps to reduce number of iterations
      if(elementProps.includes(sourceProp)) {
        const currentValue = this.get(sourceProp);
        const newValue = ElementUtils.getNewSourceValue(currentValue, sourceMap);
        if(newValue !== undefined) {
          this.set(sourceProp, deepClone(newValue));
        }
      }
    }
    for(const sourceProp of en.sourcePropertyNames.elementArrayProperties) {
      if(elementProps.includes(sourceProp)) {
        const currentValue = this.get(sourceProp);
        const newValue = ElementUtils.getNewSourceValueArray(currentValue, sourceMap);
        if(newValue !== undefined && newValue.length !== 0) {
          this.set(sourceProp, deepClone(newValue));
        }
      }
    }
    //Get file ids from item properties
    for(const sourceProp of en.sourcePropertyNames.itemProperties) {
      for(const item of Object.values(this.getRecordMap(RT.item))) {
        const itemProps = Object.keys(item.props);
        if(itemProps.includes(sourceProp)) { //Not checking for image_source, as it isn't used in items
          const currentValue = item.props[sourceProp];
          const newValue = ElementUtils.getNewSourceValue(currentValue, sourceMap);
          if(newValue !== undefined) {
            item.props[sourceProp] = deepClone(newValue);
          }
        }
      }
    }
  }

  addElementOfType (elementType: ElementType, position?: number): RecordNode<RT.element> {
    const defaultName = ElementUtils.getElementDefinition(elementType).elementDefaultName;
    const newElement = createRecord<RT.element>(RT.element, defaultName);
    newElement.props = ElementUtils.getElementTypeDefaults(elementType);
    newElement.props.element_type = elementType;
    this.addRecord({record: newElement, position});
    return newElement;
  }
}

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
