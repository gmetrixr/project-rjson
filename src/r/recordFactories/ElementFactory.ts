import { eTypeToDefn } from "../definitions/elements/index.js";
import { ElementType, isElementType } from "../definitions/elements/ElementDefinition.js";
import { RecordFactory } from "../R/RecordFactory.js";
import { createRecord, RecordNode } from "../R/RecordNode.js";
import { RT, recordTypeDefinitions, RTP, rtp } from "../R/RecordTypes.js";
import { en, fn } from "../definitions/index.js";
import { jsUtils } from "@gmetrixr/gdash";
import { ElementUtils } from "./ElementUtils.js";

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

    //Get file ids from substitute properties
    for(const sourceProp of en.sourcePropertyNames.substituteProperties) {
      for(const substitute of Object.values(this.getRecordMap(RT.substitute))) {
        const substituteProps = Object.keys(substitute.props);
        if(substituteProps.includes(sourceProp)) { //Not checking for image_source, as it isn't used in substitutes
          fileIds.push(...ElementUtils.getFileIdsFromValue(substitute.props[sourceProp]));
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

    //Get file ids from substitute properties
    for(const sourceProp of en.sourcePropertyNames.substituteProperties) {
      for(const substitute of Object.values(this.getRecordMap(RT.substitute))) {
        const substituteProps = Object.keys(substitute.props);
        if(substituteProps.includes(sourceProp)) { //Not checking for image_source, as it isn't used in substitutes
          const currentValue = substitute.props[sourceProp];
          const newValue = ElementUtils.getNewSourceValue(currentValue, sourceMap);
          if(newValue !== undefined) {
            substitute.props[sourceProp] = deepClone(newValue);
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
