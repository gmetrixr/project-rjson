import { flatten, uniq, values } from "ramda";
import { isVariableType, predefinedVariableIdToName, variableTypeToDefn } from "../definitions/variables";
import {
  predefinedVariableDefaults,
  PredefinedVariableName,
  VarCategory,
  VariableType,
  variableTypeDefaults,
} from "../definitions/variables/VariableTypes";
import { ClipboardData, RecordFactory, idAndRecord, idOrAddress } from "../R/RecordFactory";
import { ClipboardR, createRecord, RecordMap, RecordNode } from "../R/RecordNode";
import { RT, rtp } from "../R/RecordTypes";
import { SceneFactory } from "./SceneFactory";
import { jsUtils } from "@gmetrixr/gdash";
import { ElementFactory, ElementUtils } from "./ElementFactory";
import { en, fn } from "../definitions";
import { ProjectProperty } from "../recordTypes/Project";
import { ElementProperty } from "../recordTypes/Element";
import { ItemProperty } from "../recordTypes/Item";
import { OptionProperty } from "../recordTypes/Options";
import { ShoppingProperty } from "../recordTypes/Shopping";
import { MenuProperty } from "../recordTypes/Menu";
import { ElementType } from "../definitions/elements/ElementDefinition";
import { RuleAction, ThenActionProperty } from "../definitions/rules";
import { LeadGenFieldProperty } from "../recordTypes/LeadGenField";

const { deepClone, difference, union, intersection } = jsUtils;
type variable = RT.variable;
const variable = RT.variable;

/**
 * @example
 * projectFactory1  = r.project(projectJson): ProjectFactory
 * project1         = r.project(projectJson).json(): RecordNode<project> (project1 === projectJson)
 *
 * Add Scene:
 * t.project(projectJson).addScene(scene1Json).json(): RecordNode<scene>
 */
export class ProjectFactory extends RecordFactory<RT.project> {
  constructor(json: RecordNode<RT.project>) {
    super(json);
  }

  addElementRecord<T>({record, position, id, dontCycleSubRecordIds, parentIdOrAddress, elementType}: {
    record: RecordNode<RT>, position?: number, id?: number, dontCycleSubRecordIds?: boolean, parentIdOrAddress?: idOrAddress, elementType: ElementType
  }): idAndRecord | undefined {
    const idAndRecord = this.addRecord({record, position, id, dontCycleSubRecordIds, parentIdOrAddress});
    if(idAndRecord) {
      idAndRecord.record.props.element_type = elementType;
    }
    return idAndRecord;
  }

  /**
   * addBlankRecord calls addRecord internally. So just overriding addRecord is enough.
   * 
   * Override adding of scene - 
   *   Also add scene_id to the menu in case auto_add_new_scene_to_menu is true
   * Override adding of lead_gen_field -
   *   All lead gen fields need a corresponding variable in which its value is saved
   *   The corresponding variable is saved in the field var_id (of type string) in lead_gen_field
   *   These variable definitions (like name/type) shouldn't be modifiable by the user (read only = true)
   * 
   * Just overriding addRecord should take care of paste issues also, as it internally calls this.addRecord
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/super#calling_methods_from_super
   */
  addRecord<T>({record, position, id, dontCycleSubRecordIds, parentIdOrAddress}: {
    record: RecordNode<RT>, position?: number, id?: number, dontCycleSubRecordIds?: boolean, parentIdOrAddress?: idOrAddress
  }): idAndRecord | undefined {
    //Don't allow adding sub-records to elements that are not groups
    if(parentIdOrAddress) {
      const parentRecord = this.getDeepRecord(parentIdOrAddress);
      if(parentRecord === undefined) return undefined;
      if(parentRecord.type === RT.element) {
        if(parentRecord.props.element_type !== ElementType.group) {
          return undefined;
        }
      }
    }

    const idAndRecord = super.addRecord({record, position, id, dontCycleSubRecordIds, parentIdOrAddress});
    if(idAndRecord === undefined) return undefined;
    //Custom Record Types' Code
    switch (record.type) {
      case RT.scene: {
        this.refreshRecordsLinkedToScene(idAndRecord);
        break;
      }
      case RT.lead_gen_field: {
        this.refreshRecordsLinkedToLeadGen(idAndRecord);
        break;
      }
      case RT.element: {
        this.refreshRecordsLinkedToElement(idAndRecord);
        break;
      }
    }
    return idAndRecord;
  }

  /** 
   * Adds menu and tourMode records 
   * Keeps record ids deterministic, so even if this function is called twice, there are no side effects
   */
  private refreshRecordsLinkedToScene(sceneIdAndRecord: idAndRecord) {
    //Add menu entry. Calling super.addBlankRecord and not ProjectFactory.addBlankRecord because internally it call addRecord, 
    //would end up in a cyclic call.
    const menuRecordId = sceneIdAndRecord.id + 10001;
    const menuRecordPresent = this.getRecord(menuRecordId, RT.menu);
    if(menuRecordPresent === undefined) {
      const newMenuRecord = super.addBlankRecord({type: RT.menu, id: menuRecordId});
      if(newMenuRecord) {
        newMenuRecord.record.props.menu_scene_id = sceneIdAndRecord.id;
        newMenuRecord.record.props.menu_show = this.getValueOrDefault(rtp.project.auto_add_new_scene_to_menu);
      }
    }

    const tourRecordId = sceneIdAndRecord.id + 10002;
    const tourRecordPresent = this.getRecord(tourRecordId, RT.tour_mode);
    if(tourRecordPresent === undefined) {
      // Adding scene details every time to menu prop and making the boolean menu_show true / false based on the value given or default which is true.
      if (this.getValueOrDefault(rtp.project.auto_add_new_scene_to_tour_mode) === true) {
        //Making id deterministic (although not needed) - for testing
        const tourModeRecord = super.addBlankRecord({type: RT.tour_mode, id: tourRecordId});
        if(tourModeRecord) {
          tourModeRecord.record.props.tour_mode_scene_id = sceneIdAndRecord.id;
        }
      }
    }
  }

  private refreshRecordsLinkedToLeadGen(leadGenIdAndRecord: idAndRecord) {
    this.linkAutogeneratedVariable(leadGenIdAndRecord, VariableType.string, LeadGenFieldProperty.var_id)
  }

  private refreshRecordsLinkedToElement(elementIdAndRecord: idAndRecord) {
    const record = elementIdAndRecord.record;
    switch ((record as RecordNode<RT.element>).props.element_type) {
      case ElementType.media_upload: {
        this.linkAutogeneratedVariable(elementIdAndRecord, VariableType.string, ElementProperty.media_upload_var_id)
        break;
      }

      case ElementType.embed_scorm: {
        this.linkAutogeneratedVariable(elementIdAndRecord, VariableType.number, ElementProperty.embed_scorm_score_var_id, "_scorm_score")
        this.linkAutogeneratedVariable(elementIdAndRecord, VariableType.string, ElementProperty.embed_scorm_suspend_data_var_id, "_scorm_suspend")
        this.linkAutogeneratedVariable(elementIdAndRecord, VariableType.number, ElementProperty.embed_scorm_progress_var_id, "_scorm_progress")
        break;
      }
    }
  }

  private linkAutogeneratedVariable(idAndRecord: idAndRecord, variableType: VariableType, linkedPropName: string, nameSuffix?: string) {
    let variableIdAndRecord;
    const currentlyLinkedId = (idAndRecord.record.props as any)[linkedPropName] as number;
    //In case its already linked, don't add a new variable
    if(currentlyLinkedId !== undefined) {
      variableIdAndRecord = this.getIdAndRecord(currentlyLinkedId, RT.variable);
    } else {
      variableIdAndRecord = this.addVariableOfType(variableType);
      if(variableIdAndRecord) {
        variableIdAndRecord.record.props.var_category = VarCategory.autogenerated;
        variableIdAndRecord.record.props.var_track = true;
        variableIdAndRecord.record.props.var_default = variableTypeDefaults[variableType];
        (idAndRecord.record.props as any)[linkedPropName] = variableIdAndRecord.id;
      }
    }
    if(variableIdAndRecord) {
      //Keep the name of the variable same as the lead gen field
      this.changeRecordName(variableIdAndRecord.id, varNameFromOriginName(idAndRecord.record.name + (nameSuffix ?? "")));
    }
  }

  private deleteRecordsLinkedToScene(sceneIdAndRecord: idAndRecord) {
    //Add menu entry. Calling super.addBlankRecord and not ProjectFactory.addBlankRecord because internally it call addRecord, 
    //would end up in a cyclic call.
    const menuRecordId = sceneIdAndRecord.id + 10001;
    this.deleteRecord(menuRecordId, RT.menu);
    const tourRecordId = sceneIdAndRecord.id + 10002;
    this.deleteRecord(tourRecordId, RT.tour_mode);
  }

  private deleteRecordsLinkedToLeadGen(leadGenIdAndRecord: idAndRecord) {
    const linkedVarId = (leadGenIdAndRecord.record as RecordNode<RT.lead_gen_field>).props[LeadGenFieldProperty.var_id] as number;
    this.deleteRecord(linkedVarId, RT.variable);
  }

  private deleteRecordsLinkedToElement(elementIdAndRecord: idAndRecord) {
    const record = elementIdAndRecord.record;
    switch ((record as RecordNode<RT.element>).props.element_type) {
      case ElementType.media_upload: {
        ElementProperty.media_upload_var_id
        const linkedVarId = (record as RecordNode<RT.element>).props.media_upload_var_id as number;
        this.deleteRecord(linkedVarId, RT.variable);
        break;
      }

      case ElementType.embed_scorm: {
        const linkedScoreScoreVarId = (record as RecordNode<RT.element>).props.embed_scorm_score_var_id as number;
        this.deleteRecord(linkedScoreScoreVarId, RT.variable);
        const linkedScormSuspendVarId = (record as RecordNode<RT.element>).props.embed_scorm_suspend_data_var_id as number;
        this.deleteRecord(linkedScormSuspendVarId, RT.variable);
        const linkedScormProgressVarId = (record as RecordNode<RT.element>).props.embed_scorm_progress_var_id as number;
        this.deleteRecord(linkedScormProgressVarId, RT.variable);
        break;
      }
    }
  }

  deleteRecord<N extends RT>(id: number, type?: N): idAndRecord | undefined {
    const idAndRecord = super.deleteRecord(id, type);
    if(idAndRecord === undefined) return undefined;
    //Custom Record Types' Code
    switch (idAndRecord.record.type) {
      case RT.scene: {
        this.deleteRecordsLinkedToScene(idAndRecord);
        break;
      }
      case RT.lead_gen_field: {
        this.deleteRecordsLinkedToLeadGen(idAndRecord);
        break;
      }
      case RT.element: {
        this.deleteRecordsLinkedToElement(idAndRecord);
        break;
      }
    }
    return idAndRecord;
  }

  changeRecordName<N extends RT>(id: number, newName?: string, type?: N): idAndRecord | undefined {
    const oldName = this.getDeepRecord(id)?.name;
    const idAndRecord = super.changeRecordName(id, newName, type);
    if(idAndRecord === undefined) return undefined;
    //Custom Record Types' Code
    switch (idAndRecord.record.type) {
      case RT.scene: {
        this.refreshRecordsLinkedToScene(idAndRecord);
        break;
      }
      case RT.lead_gen_field: {
        this.refreshRecordsLinkedToLeadGen(idAndRecord);
        break;
      }
      case RT.element: {
        this.refreshRecordsLinkedToElement(idAndRecord);
        break;
      }
      case RT.variable: {
        if(oldName !== undefined) {
          this.updateRecordsLinkedToVariableTemplate(idAndRecord, oldName);
        }
        break;
      }
    }
    return idAndRecord;
  }

  updateRecordsLinkedToVariableTemplate(variableIdAndRecord: idAndRecord, oldName: string) {
    const newName = variableIdAndRecord.record.name;
    if(newName) {
      const deepRecords = this.getDeepRecordEntries();
      for(const [id, record] of deepRecords) {
        this.updateStringTemplateInRecord(record, oldName, newName);
      }
    }
  }

  updateStringTemplateInRecord(record: RecordNode<RT>, oldVarName: string, newVarName: string) {
    const searchValue = new RegExp(`({{[s]*${oldVarName}[s]*}})+`, "gm");
    const replaceValue = `{{${newVarName}}}`;
    switch(record.type) {
      case RT.element: {
        const elementRecord = record as RecordNode<RT.element>;
        switch (elementRecord.props.element_type) {
          case ElementType.text: {
            const oldValue = elementRecord.props.text as string;
            elementRecord.props.text = oldValue.replace(searchValue, replaceValue);
            break;
          }
          case ElementType.embed_html: {
            const oldValue = elementRecord.props.embed_string as string;
            elementRecord.props.embed_string = oldValue.replace(searchValue, replaceValue);
            break;
          }
        }
        break;
      }
      case RT.then_action: {
        const taRecord = record as RecordNode<RT.then_action>;
        let properties = (taRecord.props.properties || []) as string[];
        properties = properties.map(p => p?.replace(searchValue, replaceValue));
        taRecord.props.properties = properties;
        break;
      }
    }
    for(const [prop, oldValue] of Object.entries(record.props)) {
      if(typeof oldValue === "string") {
        const newValue = oldValue.replace(searchValue, replaceValue);
        (record.props as any)[prop] = newValue;
      }
    }
  }

  //VARIABLE SPECIFIC FUNCTIONS
  /**
   * Override general variable defaults with the defaults specified for the given variableType
   */
  addVariableOfType(variableType: VariableType, id?: number): idAndRecord | undefined {
    const defaults = variableTypeToDefn[variableType];
    const record = createRecord<RT.variable>(variable, defaults.varDefaultName);
    record.props.var_default = defaults.varDefaultValue;
    record.props.var_type = variableType;
    record.props.var_category = VarCategory.user_defined;
    return this.addRecord<RT.variable>({record, id});
  }

  /**
   * Variables linked to specific functions, that need specific fixed ids (and names)
   * Predefined variables cannot be renamed or delted by the user, and are not shown on Variables interface
   */
  addPredefinedVariable(predefinedVariableName: PredefinedVariableName): idAndRecord | undefined {
    const pdvarDefaults = predefinedVariableDefaults[predefinedVariableName];
    let record = super.getRecord(pdvarDefaults.id, RT.variable);
    if(record !== undefined) {
      return {id: pdvarDefaults.id, record};
    } else {
      const addedRecordAndId = this.addVariableOfType(pdvarDefaults.type, pdvarDefaults.id);
      if(addedRecordAndId !== undefined) {
        addedRecordAndId.record.props.var_category = VarCategory.predefined;
        addedRecordAndId.record.props.var_track = true;
        addedRecordAndId.record.name = predefinedVariableName;
      }
      return addedRecordAndId;
    }
  }

  addGlobalVariable(globalVar: RecordNode<RT.variable>, id: number): idAndRecord | undefined {
    const record = deepClone(globalVar);
    record.props.var_category = VarCategory.global;
    record.props.var_track = true;
    return this.addRecord({record: globalVar, id});
  }

  /**
   * This needs to be done everytime before the project is loaded in the editor.
   * Because the definitions of the global vars might get updated anytime.
   */
  updateGlobalVariableProperties(gvsMap: RecordMap<RT.variable>): void {
    for (const [vid, variable] of this.getRecordEntries(RT.variable)) {
      if (variable.props.var_category === VarCategory.global) {
        const variableFromOrg = gvsMap[vid];
        if (variableFromOrg !== undefined) {
          variable.name = variableFromOrg.name;
          variable.props.var_default = variableFromOrg.props.var_default;
          variable.props.var_type = variableFromOrg.props.var_type;
        } else {
          console.log(`Variable ${vid} was marked global but not found in the passed global vars map. Marking it non-global`);
          variable.props.var_category = VarCategory.user_defined;
        }
      }
    }
  }

  //SCENE SPECIFIC FUNCTIONS
  getInitialSceneId(): number {
    const initialSceneId = this.get(rtp.project.initial_scene_id) as (number | undefined);
    //Ignore the default value 0, it means its not set
    if (initialSceneId !== undefined && initialSceneId !== 0) {
      // also check if a scene with this id is valid
      const scene = this.getRecord(initialSceneId, RT.scene);
      if (scene) {
        return Number(initialSceneId);
      } else {
        return this.getRecordIds(RT.scene)[0];
      }
    } else {
      return this.getRecordIds(RT.scene)[0];
    }
  }

  //PROJECT SPECIFIC FUNCTIONS
  /**
   * Note: A thumbnail is different form logo.
   * Logo is displayed above clickToStart. Can be the org logo for example.
   * Thumbnail shows is displayed in project listing page. Can be distinguish the project visually.
   *
   * Temporary until a full-fledged thumbnail generator is created
   * Works only on projects that have gone through "injectSourceIntoProject" (i.e. its source.file_urls are populated)
   * This just gets the first scene of the project and returns the thubmnail of the first pano it finds in it
   */
  getProjectThumbnail(): string | undefined {
    let thumbnail;
    const projectThumbnailSource = <fn.Source>this.get(rtp.project.project_thumbnail_source) as fn.Source;
    if(projectThumbnailSource !== undefined && projectThumbnailSource.file_urls?.o) {
      return projectThumbnailSource.file_urls.o;
    }
    const initialSceneId = this.getInitialSceneId();
    if (initialSceneId === undefined) return undefined;
    const scene = this.getRecord(initialSceneId, RT.scene);
    let elementF: ElementFactory;
    if (scene !== undefined) {
      const elementDeepRecordEntries = new SceneFactory(scene).getDeepRecordEntries(RT.element);
      for (const [eid, e] of elementDeepRecordEntries) {
        elementF = new ElementFactory(e);
        if (elementF.getElementType() === en.ElementType.pano_image) {
          const source = <fn.Source>elementF.get(rtp.element.source);
          const newThumbnail = (<any>source?.file_urls)?.t ?? (<any>source?.file_urls)?.o;
          if (newThumbnail !== undefined) {
            thumbnail = newThumbnail;
            break;
          }
        }
      }
    }
    return thumbnail;
  }

  getFileIdsFromProject(): number[] {
    const fileIds: number[] = [];
    for (const scene of this.getRecords(RT.scene)) {
      const elementEntries = new SceneFactory(scene).getDeepRecordEntries(RT.element);
      for (const [eid, e] of elementEntries) {
        fileIds.push(...new ElementFactory(e).getFileIdsFromElement());
      }
    }
    const projectLogo = <fn.Source>this.get(rtp.project.project_logo_source);
    if (projectLogo !== undefined) {
      fileIds.push(projectLogo.id);
    }

    const projectThumbnail = <fn.Source>this.get(rtp.project.project_thumbnail_source);
    if (projectThumbnail !== undefined) {
      fileIds.push(projectThumbnail.id);
    }

    return [...new Set(fileIds)]; //Unique ids only
  }

  injectSourceIntoProject(sourceMap: { [id: number]: fn.Source }): void {
    for (const scene of this.getRecords(RT.scene)) {
      const elementEntries = new SceneFactory(scene).getDeepRecordEntries(RT.element);
      for (const [eid, e] of elementEntries) {
        new ElementFactory(e).injectSourceIntoElement(sourceMap);
      }
    }
    const projectLogo = <fn.Source>this.get(rtp.project.project_logo_source);
    if (projectLogo !== undefined) {
      const newValue = sourceMap[projectLogo.id];
      if (newValue !== undefined) {
        this.set(rtp.project.project_logo_source, newValue);
      }
    }

    const projectThumbnail = <fn.Source>this.get(rtp.project.project_thumbnail_source);
    if (projectThumbnail !== undefined) {
      const newValue = sourceMap[projectThumbnail.id];
      if (newValue !== undefined) {
        this.set(rtp.project.project_thumbnail_source, newValue);
      }
    }
  }

  getMetadata(): string[] {

    // 1. Project meta fields
    const metaArray = [
      this.get(ProjectProperty.description),
      this.get(ProjectProperty.project_start_description),
      this.get(ProjectProperty.project_end_description)
    ];

    // 2. Scene DOESN'T have meta fields
    for (const scene of this.getRecords(RT.scene)) {
      const elementEntries = new SceneFactory(scene).getDeepRecordEntries(RT.element);
      for (const [eid, e] of elementEntries) {

        // 3. Element meta fields
        const elementF = new ElementFactory(e);
        metaArray.push(elementF.get(ElementProperty.text));
        metaArray.push(elementF.get(ElementProperty.ssml));
        metaArray.push(elementF.get(ElementProperty.placeholder_text));
        metaArray.push(elementF.get(ElementProperty.embed_string));
        metaArray.push(elementF.get(ElementProperty.description));
        metaArray.push(elementF.get(ElementProperty.short_description));

        // 4. Items meta fields
        for (const itemRecord of elementF.getRecords(RT.item)) {
          const itemF = new RecordFactory(itemRecord);
          metaArray.push(itemF.get(ItemProperty.item_description));
          metaArray.push(itemF.get(ItemProperty.item_instruction));
          metaArray.push(itemF.get(ItemProperty.item_text));
          metaArray.push(itemF.get(ItemProperty.phrase));

          // 5. Options meta fields
          for (const optionRecord of itemF.getRecords(RT.option)) {
            const optionF = new RecordFactory(optionRecord);
            metaArray.push(optionF.get(OptionProperty.option_text));
          }
        }
      }
    }

    for (const menuItem of this.getRecords(RT.menu)) {
      const menuItemR = new RecordFactory(menuItem);
      if (menuItemR.get(MenuProperty.menu_show) === true) {
        metaArray.push(menuItemR.get(MenuProperty.menu_display_name));
      }
    }

    // 6. Shopping meta fields
    for (const shoppingRecord of this.getRecords(RT.shopping)) {
      const shoppingF = new RecordFactory(shoppingRecord);
      metaArray.push(shoppingF.get(ShoppingProperty.store_name));
    }

    return <string[]>metaArray
      .filter(metaProp => metaProp !== undefined && metaProp !== "" && metaProp !== null)
      .map(metaProp =>
        (metaProp as string)
          .replace(/\n/g, " ") // replace newline with space
          .replace(/_/g, " ") // replace "_" with space
          .replace(/{[^}]*}*/gm, "") // removes {{abc}}
          .replace(/<[^>]*>?/gm, "") // removes html
          .trim());
  }

  /**
   * When scenes are copied, also copy the referenced variables (in rules and templates)
   * No need to copy predefined variables - as they will be present in destination also
   * No need to copy global variables - as there's no way to define them at org level
   */
  copyToClipboard(selectedIdOrAddrs: idOrAddress[]): ClipboardData {
    const variableIdsToBeAdded = new Set<number>();
    //First get a list of variables to be matched
    const variableEntries = this.getRecordEntries(RT.variable)
      .filter(([id, value]) => (value.props.var_category === VarCategory.user_defined || value.props.var_category === VarCategory.autogenerated));
    const variableIds = variableEntries.map(([id, val]) => Number(id));
    const variableNames = [];
    for(const [id, value] of variableEntries) {
      if(value.name) {
        variableNames.push(value.name);
      }
    }
  
    //Then check if any of these need to be added to the copied nodes
    const clipboardData = super.copyToClipboard(selectedIdOrAddrs);
    for(const [id, copiedRecord] of Object.entries(clipboardData.nodes)) {
      if(copiedRecord.record.type === RT.scene) {
        //Then go over all sub records to check if the variable name or ids exist in properties
        const sceneFactory = new SceneFactory(copiedRecord.record);
        for(const [id, subRecord] of sceneFactory.getDeepRecordEntries()) {
          for(const [propName, propValue] of Object.entries(subRecord.props)) {
            if(typeof propValue === "number") {
              if(variableIds.includes(propValue)) {
                variableIdsToBeAdded.add(propValue);
                break;
              }
            } else if (typeof propValue === "string") {
              for(const [varId, varValue] of variableEntries) {
                if(varValue.name && propValue.includes(varValue.name)) {
                  variableIdsToBeAdded.add(varId);
                }
              }
            }
          }
        }
      }
    }

    //Then add those to copied nodes
    const variableRecordMap = this.getRecordMap(RT.variable);
    for(const varId of variableIdsToBeAdded) {
      clipboardData.nodes.push({id: varId, record: variableRecordMap[varId]});
    }

    return clipboardData;
  }

  pasteFromClipboard(parentIdOrAddr: idOrAddress, clipboardData: ClipboardData, positionInPlace?: number) {
    const parentRecord = this.getDeepRecord(parentIdOrAddr);
    if(parentRecord !== undefined) {
      const parentRF = new RecordFactory(parentRecord);
      for(const node of clipboardData.nodes) {
        parentRF.addRecord({record: node.record, position: positionInPlace});
      }
    }
  }
}

export class ProjectUtils {
  ruleNamesDict: { [key: string]: number[] };
  accentColorsDict: { [key: string]: number[] };
  elementNamesDict: { [key: string]: number[] };
  variableNamesDict: { [key: string]: number[] };
  propsNameDict: { [key: string]: number[] };
  actionDict: { [key: string]: number[] };
  eventsDict: { [key: string]: number[] };

  constructor() {
    this.ruleNamesDict = {};
    this.accentColorsDict = {};
    this.elementNamesDict = {};
    this.variableNamesDict = {};
    this.propsNameDict = {};
    this.actionDict = {};
    this.eventsDict = {};
  }

  buildRulesDictionary = (project: RecordNode<RT.project>, sceneId: number): void => {
    this.ruleNamesDict = {};
    this.accentColorsDict = {};
    this.elementNamesDict = {};
    this.variableNamesDict = {};
    this.propsNameDict = {};
    this.actionDict = {};
    this.eventsDict = {};

    const projectF = new ProjectFactory(project);
    const scene = projectF.getRecord(sceneId, RT.scene);

    if (scene) {
      const sceneF = new SceneFactory(scene);
      const rules = sceneF.getRecordMap(RT.rule);

      for (const rId in rules) {
        const ruleId = Number(rId);
        const rule = rules[ruleId];
        const ruleF = new RecordFactory(rule);

        const ruleName = ruleF.getName()?.trim().toLowerCase();
        const accentColor = (ruleF.getValueOrDefault(rtp.rule.accent_color) as string).trim().toLowerCase();

        // rule name entry
        if (ruleName) {
          this.ruleNamesDict[ruleName] ?
            this.ruleNamesDict[ruleName].push(ruleId) :
            this.ruleNamesDict[ruleName] = [ruleId];
        }

        // accent colour entry
        if (accentColor) {
          this.accentColorsDict[accentColor] ?
            this.accentColorsDict[accentColor].push(ruleId) :
            this.accentColorsDict[accentColor] = [ruleId];
        }

        // element and variable names entries
        const elementEntries = sceneF.getDeepRecordEntries(RT.element);
        const whenEvents = ruleF.getRecords(RT.when_event);

        for (const we of whenEvents) {
          const coId = we.props.co_id as number;

          const elementEntry = elementEntries.find(ele => ele[0] === coId);
          if (!elementEntry) return;
          const element = elementEntry[1];
          const variable = projectF.getRecord(coId, RT.variable);
          if (element) {
            const eleName = element.name?.trim().toLowerCase();
            if (eleName) {
              this.elementNamesDict[eleName] ?
                this.elementNamesDict[eleName].push(ruleId) :
                this.elementNamesDict[eleName] = [ruleId];
            }
          }

          const event = we.props.event as string;
          this.eventsDict[event] ?
            this.eventsDict[event].push(ruleId) :
            this.eventsDict[event] = [ruleId];

          if (variable) {
            const varName = variable.name?.trim().toLowerCase();
            if (varName) {
              this.variableNamesDict[varName] ?
                this.variableNamesDict[varName].push(ruleId) :
                this.variableNamesDict[varName] = [ruleId];
            }
          }
        }

        const thenActions = ruleF.getRecords(RT.then_action);
        for (const ta of thenActions) {
          // const whenEventF = new RecordFactory(we);
          const coId = ta.props.co_id as number;
          const elementEntry = elementEntries.find(ele => ele[0] === coId);
          if (!elementEntry) return;
          const element = elementEntry[1];
          const variable = projectF.getRecord(coId, RT.variable);

          if (element) {
            const eleName = element.name?.trim().toLowerCase();
            if (eleName) {
              this.elementNamesDict[eleName] ?
                this.elementNamesDict[eleName].push(ruleId) :
                this.elementNamesDict[eleName] = [ruleId];
            }
          }

          const action = ta.props.action as string;
          this.actionDict[action] ?
            this.actionDict[action].push(ruleId) :
            this.actionDict[action] = [ruleId];

          switch (ta.props.action) {
            case RuleAction.open_url:
            case RuleAction.open_deployment:
            case RuleAction.call_api:
            case RuleAction.load_project:
            case RuleAction.set_to_formula:
            case RuleAction.set_to_string:
            case RuleAction.copy_to_clipboard:
            case RuleAction.replace_screen_reader_text:
            case RuleAction.set_to_number:
            case RuleAction.add_number: {
              if (Array.isArray(ta.props.properties)) {
                for(const p of ((ta.props.properties ?? []) as string[])) {
                  this.propsNameDict[p] ?
                    this.propsNameDict[p].push(ruleId) :
                    this.propsNameDict[p] = [ruleId];
                }
              }
              break;
            }

            case RuleAction.point_to:
            case RuleAction.seek_to_timer:
            case RuleAction.teleport: {
              if (Array.isArray(ta.props.properties)) {
                const elem_id = ta.props.properties[0] as number;
                const elementEntry = elementEntries.find(ele => ele[0] === elem_id);
                if (!elementEntry) return;
                const element = elementEntry[1];
                const elementName = element?.name?.trim().toLowerCase();

                if (elementName) {
                  this.propsNameDict[elementName] ?
                    this.propsNameDict[elementName].push(ruleId) :
                    this.propsNameDict[elementName] = [ruleId];
                }
              }

              break;
            }

            case RuleAction.change_scene: {
              if (Array.isArray(ta.props.properties)) {
                const sceneId = ta.props.properties[0] as number;
                const scene = projectF.getRecord(sceneId, RT.scene);
                const sceneName = scene?.name?.trim().toLowerCase();
                if(sceneName) {
                  this.propsNameDict[sceneName] ?
                    this.propsNameDict[sceneName].push(ruleId) :
                    this.propsNameDict[sceneName] = [ruleId];
                }
              }
              break;
            }
            case RuleAction.hide_item:
            case RuleAction.show_item: {
              if (Array.isArray(ta.props.properties)) {
                const itemId = ta.props.properties[0] as number;
                const itemEntries = sceneF.getDeepRecordEntries(RT.item);
                const itemEntry = itemEntries.filter(item => item[0] === itemId);
                if (!itemEntry) return;
                const items = itemEntry.map(item => item[1]);

                for(const i of items) {
                  const itemName = i.name?.trim().toLowerCase();
                  if(itemName) {
                    this.propsNameDict[itemName] ?
                      this.propsNameDict[itemName].push(ruleId) :
                      this.propsNameDict[itemName] = [ruleId];
                  }
                }
              }
              break;
            }
            default:
              break;
          }

          if (variable) {
            const varName = variable.name?.trim().toLowerCase();
            if (varName) {
              this.variableNamesDict[varName] ?
                this.variableNamesDict[varName].push(ruleId) :
                this.variableNamesDict[varName] = [ruleId];
            }
          }
        }
      }
    }
  };

  simpleSearchInRules({ searchString, accentColor }: {
    searchString: string;
    accentColor?: string;
  }): number[] {
    // to filter by accent colour
    const idsForAccentColor: number[] = accentColor ?
      this.accentColorsDict[accentColor.toLowerCase()] :
      flatten(Object.values(this.accentColorsDict));

    if (accentColor && !searchString) {
      return uniq(idsForAccentColor);
    }

    // search in rule names
    const matchingRuleNames: string[] = Object.keys(this.ruleNamesDict).filter((key: string) => key.includes(searchString.trim().toLowerCase()));
    const idsForRuleNames: number[] = flatten(matchingRuleNames.map((key: string) => this.ruleNamesDict[key]));

    // search in element names
    const matchingElementNames: string[] = Object.keys(this.elementNamesDict).filter((key: string) => key.includes(searchString.trim().toLowerCase()));
    const idsForElementNames: number[] = flatten(matchingElementNames.map((key: string) => this.elementNamesDict[key]));

    // search in variable names
    const matchingVariableNames: string[] = Object.keys(this.variableNamesDict).filter((key: string) => key.includes(searchString.trim().toLowerCase()));
    const idsForVariableNames: number[] = flatten(matchingVariableNames.map((key: string) => this.variableNamesDict[key]));

    const matchingEvents: string[] = Object.keys(this.eventsDict).filter((key: string) => key.includes(searchString.trim().toLowerCase()));
    const idsForEvents: number[] = flatten(matchingEvents.map((key: string) => this.eventsDict[key]));

    const matchingAction: string[] = Object.keys(this.actionDict).filter((key: string) => key.includes(searchString.trim().toLowerCase()));
    const idsForAction: number[] = flatten(matchingAction.map((key: string) => this.actionDict[key]));

    const matchingProps: string[] = Object.keys(this.propsNameDict).filter((key: string) => key.includes(searchString.trim().toLowerCase()));
    const idsForProps: number[] = flatten(matchingProps.map((key: string) => this.propsNameDict[key]));

    const concatenatedRuleIds: number[] = idsForElementNames.concat(idsForRuleNames).concat(idsForVariableNames).concat(idsForEvents).concat(idsForAction).concat(idsForProps);
    let outputRuleIds: number[] = concatenatedRuleIds;
    if (searchString && accentColor) {
      const intersection = jsUtils.intersection(new Set(idsForAccentColor), new Set(concatenatedRuleIds));
      outputRuleIds = Array.from(intersection);
    }

    return uniq(outputRuleIds);
  }

  /**
   * Returns all records in a project that use string templating.
   * Generally, string templating is used in
   * 1. Text elements
   * 2. EmbedHTML elements
   * 3. Rules -> then_action with `open_url` action
   */
  static getAllTemplatedRecords(project: RecordNode<RT.project>): RecordNode<RT.element | RT.then_action>[] {
    const projectF = new ProjectFactory(project);
    const templatableElements = [ElementType.text, ElementType.embed_html];
    const templatableRulesActions = [RuleAction.open_url];
    const elementMap = projectF.getDeepRecordMap();
    const elementRecords = [];
    const ruleRecords = [];
    for (const id in elementMap) {
      const element = elementMap[id];
      if (element.type === RT.element && templatableElements.includes(element.props.element_type as ElementType)) {
        elementRecords.push(element);
      }

      if (element.type === RT.then_action && templatableRulesActions.includes(element.props.action as RuleAction)) {
        ruleRecords.push(element);
      }
    }
    return [...elementRecords, ...ruleRecords];
  }

  /**
   * Given the records from getAllTemplatedRecords, this function actually replaces the older variable name 
   * with the newer variable name in all the properties of the records that hold string templates
   */
  static updateStringTemplates(records: RecordNode<RT>[], oldVarName: string, newVarName: string): void {
    const searchValue = new RegExp(`({{[s]*${oldVarName}[s]*}})+`, "gm");
    const replaceValue = `{{${newVarName}}}`;
    for (const record of records) {
      switch (record.type) {
        case RT.element: {
          const elementRecord = (record as RecordNode<RT.element>);
          switch (elementRecord.props.element_type) {
            case ElementType.text: {
              const oldString = elementRecord.props.text as string;
              elementRecord.props.text = oldString.replace(searchValue, replaceValue);
              break;
            }
            case ElementType.embed_html: {
              const oldString = elementRecord.props.embed_string as string;
              elementRecord.props.embed_string = oldString.replace(searchValue, replaceValue);
              break;
            }
          }
          break;
        }
        case RT.then_action: {
          const ruleRecord = (record as RecordNode<RT.then_action>);
          let properties = (ruleRecord.props.properties || []) as string[];
          properties = properties.map(p => p?.replace(searchValue, replaceValue));
          ruleRecord.props.properties = properties;
        }
      }
    }
  }
}

const varNameFromOriginName = (originName: string | undefined): string => `${originName}_var`;
