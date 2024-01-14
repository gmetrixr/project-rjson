import { variableTypeToDefn } from "../definitions/variables/index.js";
import {
  ArrayOfValues,
  predefinedVariableDefaults,
  PredefinedVariableName,
  VarCategory,
  VariableType,
  variableTypeDefaults,
} from "../definitions/variables/VariableTypes.js";
import { RecordFactory } from "../R/RecordFactory.js";
import { RecordUtils } from "../R/RecordUtils.js";
import { ClipboardData, createRecord, idAndRecord, idOrAddress, rAndP, RecordMap, RecordNode } from "../R/RecordNode.js";
import { RT, rtp } from "../R/RecordTypes.js";
import { SceneFactory, SceneUtils } from "./SceneFactory.js";
import { jsUtils } from "@gmetrixr/gdash";
import { ElementFactory } from "./ElementFactory.js";
import { en, fn } from "../definitions/index.js";
import { ProjectProperty } from "../recordTypes/Project.js";
import { ElementProperty } from "../recordTypes/Element.js";
import { ItemProperty } from "../recordTypes/Item.js";
import { OptionProperty } from "../recordTypes/Options.js";
import { ShoppingProperty } from "../recordTypes/Shopping.js";
import { MenuProperty } from "../recordTypes/Menu.js";
import { elementDisplayNames, ElementType } from "../definitions/elements/ElementDefinition.js";
import { LeadGenFieldProperty } from "../recordTypes/LeadGenField.js";
import { SceneType } from "../definitions/special/index.js";
import { SubstituteProperty } from "../recordTypes/Substitute.js";
import { ProjectUtils } from "./ProjectUtils.js";
import { getFactory } from "./index.js";

const { deepClone, generateIdV2 } = jsUtils;
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

  addSceneRecord({record, position, id, dontCycleSubRecordIds, parentIdOrAddress, sceneType}: {
    record?: RecordNode<RT.scene>, position?: number, id?: number, dontCycleSubRecordIds?: boolean, parentIdOrAddress: idOrAddress, sceneType: SceneType
  }): idAndRecord<RT.scene> | undefined {
    if(!record) {
      record = createRecord(RT.scene);
    }
    const idAndRecord = this.addRecord({record, position, id, dontCycleSubRecordIds, parentIdOrAddress});
    if(idAndRecord) {
      idAndRecord.record.props.scene_type = sceneType;
      ProjectUtils.setupNewScene(this._json, idAndRecord);
    }
    return idAndRecord;
  }

  addElementRecord({record, position, id, dontCycleSubRecordIds, parentIdOrAddress, elementType}: {
    record?: RecordNode<RT.element>, position?: number, id?: number, dontCycleSubRecordIds?: boolean, parentIdOrAddress: idOrAddress, elementType: ElementType
  }): idAndRecord<RT.element> | undefined {
    if(!record) {
      record = createRecord(RT.element);
      record.props.element_type = elementType;
      record.name = elementDisplayNames[elementType];
    }
    const idAndRecord = this.addRecord({record, position, id, dontCycleSubRecordIds, parentIdOrAddress});
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
  addRecord <N extends RT>({record, position, id, dontCycleSubRecordIds, dontPosition, parentIdOrAddress}: {
    record: RecordNode<N>, position?: number, id?: number, dontCycleSubRecordIds?: boolean, dontPosition?: boolean, parentIdOrAddress?: idOrAddress
  }): idAndRecord<N> | undefined {
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

    const idAndRecord = super.addRecord({record, position, id, dontCycleSubRecordIds, dontPosition, parentIdOrAddress});
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

  getSceneOfDeepRecord(idOrAddress: idOrAddress): idAndRecord<RT.scene> | undefined {
    const breadCrumbs = this.getBreadCrumbs(idOrAddress);
    if(!breadCrumbs) return undefined;
    for(const breadCrumb of breadCrumbs) {
      if(breadCrumb.record.type === RT.scene) {
        return breadCrumb;
      }
    }
    return undefined;
  }

  /** 
   * Adds menu and tourMode records 
   * Keeps record ids deterministic, so even if this function is called twice, there are no side effects
   */
  private refreshRecordsLinkedToScene(sceneIdAndRecord: idAndRecord<RT.scene>) {
    //Add menu entry. Calling super.addBlankRecord and not ProjectFactory.addBlankRecord because internally it call addRecord, 
    //would end up in a cyclic call.
    const sceneF = new SceneFactory(sceneIdAndRecord.record);

    const menuRecordId = sceneF.get(rtp.scene.linked_menu_id) as undefined | number;
    let addNewMenu = false;
    if(menuRecordId === undefined) {
      addNewMenu = true;
    }  else {
      //Does the menu link back?
      const menu = this.getRecord(menuRecordId, RT.menu);
      const linkedSceneId = menu?.props.menu_scene_id;
      if(linkedSceneId !== sceneIdAndRecord.id) {
        addNewMenu = true;
      }
    }
    if(addNewMenu === true) {
      const newMenuIdAndRecord = super.addBlankRecord({type: RT.menu});
      if(newMenuIdAndRecord) {
        newMenuIdAndRecord.record.props.menu_scene_id = sceneIdAndRecord.id;
        newMenuIdAndRecord.record.props.menu_show = this.getValueOrDefault(rtp.project.auto_add_new_scene_to_menu);
        sceneF.set(rtp.scene.linked_menu_id, newMenuIdAndRecord.id);
      }
    }

    const tourRecordId = sceneF.get(rtp.scene.linked_tour_mode_id) as undefined | number;
    let addNewTour = false;
    if(tourRecordId === undefined) {
      addNewTour = true;
    }  else {
      //Does the tour mode link back?
      const tour = this.getRecord(tourRecordId, RT.tour_mode);
      const linkedSceneId = tour?.props.tour_mode_scene_id;
      if(linkedSceneId !== sceneIdAndRecord.id) {
        addNewTour = true;
      }
    }
    if(addNewTour === true) {
      // Adding scene details every time to menu prop and making the boolean menu_show true / false based on the value given or default which is true.
      if (this.getValueOrDefault(rtp.project.auto_add_new_scene_to_tour_mode) === true) {
        //Making id deterministic (although not needed) - for testing
        const tourModeIdAndRecord = super.addBlankRecord({type: RT.tour_mode});
        if(tourModeIdAndRecord) {
          tourModeIdAndRecord.record.props.tour_mode_scene_id = sceneIdAndRecord.id;
          sceneF.set(rtp.scene.linked_tour_mode_id, tourModeIdAndRecord.id);
        }
      }
    }
  }

  private refreshRecordsLinkedToLeadGen(leadGenIdAndRecord: idAndRecord<RT.lead_gen_field>) {
    this.linkAutogeneratedVariable(leadGenIdAndRecord, VariableType.string, LeadGenFieldProperty.var_id)
  }

  private refreshRecordsLinkedToElement(elementIdAndRecord: idAndRecord<RT.element>) {
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

  private linkAutogeneratedVariable(idAndRecord: idAndRecord<RT>, variableType: VariableType, linkedPropName: string, nameSuffix?: string) {
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
      super.changeDeepRecordName(variableIdAndRecord.id, varNameFromOriginName(idAndRecord.record.name + (nameSuffix ?? "")));
    }
  }

  duplicateDeepRecord(idOrAddress: idOrAddress): rAndP | undefined {
    const rAndP = this.getRecordAndParent(idOrAddress);
    if(rAndP === undefined) return undefined;
    const duplicatedIdAndRecord = getFactory(rAndP.p).duplicateRecord(rAndP.r.type as RT, rAndP.id);
    if(duplicatedIdAndRecord === undefined) return undefined;
    rAndP.id = duplicatedIdAndRecord?.id;
    rAndP.r = duplicatedIdAndRecord.record;
    return rAndP;
  }

  private deleteRecordsLinkedToScene(sceneIdAndRecord: idAndRecord<RT.scene>) {
    const linkedIdAndRecords = this.getLinkedSubRecords(sceneIdAndRecord.id);
    for(const idAndRecord of linkedIdAndRecords) {
      const record = idAndRecord.record;
      if(record.type === RT.menu) {
        super.deleteRecord(idAndRecord.id, RT.menu); //Not using deleteDeepRecord because we know menu is in level 1
      } else if (record.type === RT.tour_mode) {
        super.deleteRecord(idAndRecord.id, RT.tour_mode); //Not using deleteDeepRecord because we know menu is in level 1
      }
    }
  }

  private deleteRecordsLinkedToLeadGen(leadGenIdAndRecord: idAndRecord<RT.lead_gen_field>) {
    const linkedVarId = (leadGenIdAndRecord.record as RecordNode<RT.lead_gen_field>).props[LeadGenFieldProperty.var_id] as number;
    super.deleteRecord(linkedVarId, RT.variable);
  }

  private deleteRecordsLinkedToElement(elementIdAndRecord: idAndRecord<RT.element>) {
    const record = elementIdAndRecord.record;
    switch ((record as RecordNode<RT.element>).props.element_type) {
      case ElementType.media_upload: {
        ElementProperty.media_upload_var_id
        const linkedVarId = (record as RecordNode<RT.element>).props.media_upload_var_id as number;
        super.deleteRecord(linkedVarId, RT.variable);
        break;
      }

      case ElementType.embed_scorm: {
        const linkedScoreScoreVarId = (record as RecordNode<RT.element>).props.embed_scorm_score_var_id as number;
        super.deleteRecord(linkedScoreScoreVarId, RT.variable);
        const linkedScormSuspendVarId = (record as RecordNode<RT.element>).props.embed_scorm_suspend_data_var_id as number;
        super.deleteRecord(linkedScormSuspendVarId, RT.variable);
        const linkedScormProgressVarId = (record as RecordNode<RT.element>).props.embed_scorm_progress_var_id as number;
        super.deleteRecord(linkedScormProgressVarId, RT.variable);
        break;
      }

      case ElementType.group: {
        //For each sub element, run these checks and actions again
        const subRecords = new RecordFactory(record).getRecordEntries();
        for(const [subId, subRecord] of subRecords) {
          this.beforeDeleteInProjectFactory({id: subId, record: subRecord});
        }
      }
    }
    const sceneIdAndRecord = this.getSceneOfDeepRecord(elementIdAndRecord.id);
    if(sceneIdAndRecord) {
      new SceneFactory(sceneIdAndRecord?.record).deleteRulesForCoId(elementIdAndRecord.id);
    }
  }

  private deleteRecordsLinkedToVariable(variableIdAndRecord: idAndRecord<RT.variable>) {
    for(const scene of this.getRecords(RT.scene)) {
      new SceneFactory(scene).deleteRulesForCoId(variableIdAndRecord.id);
    }
  }

  /** Doesn't allow deletion of the last scene. If that is needed, go via RecordFactory */
  deleteRecord <N extends RT>(id: number, type?: N): idAndRecord<N> | undefined {
    const record = this.getRecord(id, type);
    if(!record) return undefined;
    if(record?.type === RT.scene && this.getRecordEntries(RT.scene).length === 1) {
      //Don't allow deletion of last scene
      return undefined;
    }
    this.beforeDeleteInProjectFactory({id, record});
    const idAndRecord = super.deleteRecord(id, type);
    return idAndRecord;
  }

  deleteDeepRecord <N extends RT>(idOrAddress: idOrAddress): idAndRecord<N> | undefined {
    const rAndP = this.getRecordAndParent(idOrAddress);
    if(rAndP === undefined) return undefined;
    if(rAndP.p === this._json) { //Parent is this project. In this case this.afterDeleteInProjectFactory is already run
      return this.deleteRecord(rAndP.id, rAndP.r.type as N);
    } else {
      this.beforeDeleteInProjectFactory({id: rAndP.id, record: rAndP.r});
      const idAndRecord = new RecordFactory(rAndP.p).deleteRecord(rAndP.id, rAndP.r.type as RT);
      return idAndRecord;
    }
  }

  private beforeDeleteInProjectFactory(idAndRecord?: idAndRecord<RT>) {
    if(idAndRecord === undefined) return;
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
      case RT.variable: {
        this.deleteRecordsLinkedToVariable(idAndRecord);
        break;
      }
    }
  }

  /** 
   * The ProjectFactory implementation of changeRecordName actually functions even for deep records
   * so in ProjectFactory changeDeepRecordName = changeRecordName
   **/
  changeRecordName(idOrAddress: idOrAddress, newName?: string): idAndRecord<RT> | undefined {
    const idAndRecord = this.getDeepIdAndRecord(idOrAddress);
    if(!idAndRecord) return undefined;
    const oldName = idAndRecord.record.name;
    super.changeDeepRecordName(idAndRecord.id, newName);
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

  changeDeepRecordName(idOrAddress: idOrAddress, newName?: string): idAndRecord<RT> | undefined {
    return this.changeRecordName(idOrAddress, newName);
  }

  // ! ONLY TO BE USED FOR TESTING
  TEST_CASE_updateRecordsLinkedToVariableTemplate (variableIdAndRecord: idAndRecord<RT.variable>, oldName: string) {
    this.updateRecordsLinkedToVariableTemplate(variableIdAndRecord, oldName);
  }

  private updateRecordsLinkedToVariableTemplate(variableIdAndRecord: idAndRecord<RT.variable>, oldName: string) {
    const newName = variableIdAndRecord.record.name;
    if(newName) {
      const deepRecords = this.getDeepRecordEntries();
      for(const [id, record] of deepRecords) {
        this.updateStringTemplateInRecord(record, oldName, newName);
      }
    }
  }

  // ! ONLY TO BE USED FOR TESTING
  TEST_CASE_updateStringTemplateInRecord (record: RecordNode<RT>, oldVarName: string, newVarName: string) {
    this.updateStringTemplateInRecord (record, oldVarName, newVarName);
  }

  private updateStringTemplateInRecord(record: RecordNode<RT>, oldVarName: string, newVarName: string) {
    if(oldVarName === newVarName) return;
    const searchValue = new RegExp(`({{[s]*${oldVarName}[s]*}})+`, "gm");
    const replaceValue = `{{${newVarName}}}`;
    switch(record.type) {
      case RT.element: {
        const elementRecord = record as RecordNode<RT.element>;
        switch (elementRecord.props.element_type) {
          case ElementType.text: {
            const oldValue = elementRecord.props.text;
            if (typeof oldValue === "string") {
              elementRecord.props.text = oldValue.replace(searchValue, replaceValue);
            }
            break;
          }
          case ElementType.embed_html: {
            const oldValue = elementRecord.props.embed_string;
            if (typeof oldValue === "string") {
              elementRecord.props.embed_string = oldValue.replace(searchValue, replaceValue);
            }
            break;
          }
        }
        break;
      }
      case RT.then_action: {
        const taRecord = record as RecordNode<RT.then_action>;
        if (taRecord.props.ta_properties !== undefined) {
          const properties = taRecord.props.ta_properties as ArrayOfValues;
          for (const p of properties) {
            if (typeof p === "string") {
              p.replace(searchValue, replaceValue);
            }
          }
          taRecord.props.ta_properties = properties;
        }
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
  addVariableOfType(variableType: VariableType, id?: number): idAndRecord<RT.variable> | undefined {
    const defaults = variableTypeToDefn[variableType];
    const record = createRecord<RT.variable>(variable, defaults.varDefaultName);
    record.props.var_default = defaults.varDefaultValue;
    record.props.var_type = variableType;
    record.props.var_category = VarCategory.user_defined;
    return this.addRecord({record, id});
  }

  /**
   * Variables linked to specific functions, that need specific fixed ids (and names)
   * Predefined variables cannot be renamed or delted by the user, and are not shown on Variables interface
   */
  addPredefinedVariable(predefinedVariableName: PredefinedVariableName): idAndRecord<RT.variable> | undefined {
    const pdvarDefaults = predefinedVariableDefaults[predefinedVariableName];
    const record = super.getRecord(pdvarDefaults.id, RT.variable);
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

  addGlobalVariable(globalVar: RecordNode<RT.variable>, id: number): idAndRecord<RT.variable> | undefined {
    const record = deepClone(globalVar);
    record.props.var_category = VarCategory.global;
    record.props.var_track = true;
    return this.addRecord({id, record});
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
        return this.getSortedRecordIds(RT.scene)[0];
      }
    } else {
      return this.getSortedRecordIds(RT.scene)[0];
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

    for (const avatar of this.getRecords(RT.avatar)) {
      if (avatar.props.source) {
        fileIds.push((avatar.props.source as fn.Source).id);
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

    for (const avatar of this.getRecords(RT.avatar)) {
      if (avatar.props.source) {
        const avatarF = new RecordFactory(avatar);
        const newValue = sourceMap[(avatar.props.source as fn.Source).id];
        avatarF.set(rtp.avatar.source, newValue);
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

  cycleAllSubRecordIdsForRulesFix(): void {
    //Change all rule, we, ta ids. Rules ids are not referenced from anywhere so this is a safe operaion.
    for(const [sceneId, scene] of this.getRecordEntries(RT.scene)) {
      const sceneF = new RecordFactory(scene)
      const recordMapOfRules = sceneF.getRecordMap(RT.rule);
      for(const [ruleId, rule] of sceneF.getRecordEntries(RT.rule)) {
        const oldId = ruleId;
        const newId = generateIdV2();
        recordMapOfRules[newId] = recordMapOfRules[oldId];
        delete recordMapOfRules[oldId];

        const ruleF = new RecordFactory(rule);

        const recordMapOfWE = ruleF.getRecordMap(RT.when_event);
        for(const [weId, we] of ruleF.getRecordEntries(RT.when_event)) {
          const oldId = weId;
          const newId = generateIdV2();
          recordMapOfWE[newId] = recordMapOfWE[oldId];
          delete recordMapOfWE[oldId];
        }

        const recordMapOfTA = ruleF.getRecordMap(RT.then_action);
        for(const [taId, ta] of ruleF.getRecordEntries(RT.then_action)) {
          const oldId = taId;
          const newId = generateIdV2();
          recordMapOfTA[newId] = recordMapOfTA[oldId];
          delete recordMapOfTA[oldId];
        }
      }
    }
    
    this.cycleAllSubRecordIds();
  }


  /** 
   * Used while migration v5 project v6
   * v5 ensures uniqueness of all ids within a scene
   * v6 ensures uniquess overall
   * Cannot use getDeepRecordxxxxx here :P as getDeepRecordxxxx depends on uniqueness of ids.
   */
  cycleAllSubRecordIds(): void {
    const replacementMap: {[oldId: number]: number} = {};
    //First create replacementMap
    for(const [id, record] of this.getDeepRecordEntries()) {
      //CANNOT change ids of scenes and variables already present
      if(record.type !== RT.scene && record.type !== RT.variable && record.type !== RT.lead_gen_field) {
        const oldId = id;
        const newId = generateIdV2();
        replacementMap[oldId] = newId;
      }
    }
    this.replaceAllSubRecordIds(replacementMap);
    this.replaceAllSubRecordIdsInProperties(replacementMap);
  }

  replaceAllSubRecordIds(replacementMap: {[oldId: number]: number}) {
    const allPAndRs = RecordUtils.getDeepRecordAndParentArray(this._json, []);
    for(const pAndR of allPAndRs) {
      const {id, p, r} = pAndR;
      const oldId = id;
      //Change Record Id
      if(oldId in replacementMap) {
        const newId = replacementMap[id];
        const type = r.type as RT;
        const recordMapOfType = new RecordFactory(p).getRecordMap(type);
        recordMapOfType[newId] = recordMapOfType[oldId];
        delete recordMapOfType[oldId];
      }
    }
  }

  replaceAllSubRecordIdsInProperties(replacementMap: {[oldId: number]: number}) {
    this.changeRecordIdInProperties(replacementMap);
    const allPAndRs = RecordUtils.getDeepRecordAndParentArray(this._json, []);
    for(const pAndR of allPAndRs) {
      SceneUtils.changeRecordIdInProperties(pAndR.r, replacementMap);
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

        // 4. Substitutes meta fields
        for (const substituteRecord of elementF.getRecords(RT.substitute)) {
          const substituteF = new RecordFactory(substituteRecord);
          metaArray.push(substituteF.get(SubstituteProperty.substitute_text));
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
      .filter(([id, value]) => (value.props.var_category !== VarCategory.global));
    const variableIds = variableEntries.map(([id, val]) => Number(id));
    const variableNames = [];
    for(const [id, value] of variableEntries) {
      if(value.name) {
        variableNames.push(value.name);
      }
    }
  
    //Then check if any of these need to be added to the copied nodes
    const clipboardData = super.copyToClipboard(selectedIdOrAddrs);
    for(const [id, copedIdAndRecord] of Object.entries(clipboardData.nodes)) {
      if(copedIdAndRecord.record.type === RT.scene) {
        //Then go over all sub records to check if the variable name or ids exist in properties
        const sceneFactory = new SceneFactory(copedIdAndRecord.record as RecordNode<RT.scene>);
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

  /** 
   * Don't allow copying/moving into elements that are not groups
   */
  moveDeepRecords(source: idOrAddress[], dest: idOrAddress, destPosition?: number): boolean {
    const destRecord = this.getDeepRecord(dest);
    if(destRecord === undefined) return false;
    if(destRecord.type === RT.element && destRecord.props.element_type !== ElementType.group) {
      return false;
    }
    return super.moveDeepRecords(source, dest, destPosition);
  }

  /** 
   * Don't allow copying/moving into elements that are not groups
   */
  copyDeepRecords(source: idOrAddress[], dest: idOrAddress, destPosition?: number): boolean {
    const destRecord = this.getDeepRecord(dest);
    if(destRecord === undefined) return false;
    if(destRecord.type === RT.element && destRecord.props.element_type !== ElementType.group) {
      return false;
    }
    return super.copyDeepRecords(source, dest, destPosition);
  }

  pasteFromClipboard(parentIdOrAddr: idOrAddress, clipboardData: ClipboardData, positionInPlace?: number) {
    const parentRecord = this.getDeepRecord(parentIdOrAddr);
    if(parentRecord !== undefined) {
      const parentRF = getFactory(parentRecord);
      for(const nodeIdAndRecord of clipboardData.nodes) {
        if(nodeIdAndRecord.record.type === RT.variable) {
          //if the same id exists here don't copy it. Just reuse it. If not present, add it, but don't change its id.
          if(this.getRecord(nodeIdAndRecord.id, RT.variable) === undefined) {
            parentRF.addRecord({record: nodeIdAndRecord.record, id: nodeIdAndRecord.id});  
          } // else, the same variable id exists, so don't add it
        } else {
          parentRF.addRecord({record: nodeIdAndRecord.record, position: positionInPlace});
        }
      }
    }
  }
}

const varNameFromOriginName = (originName: string | undefined): string => `${originName}_var`;
