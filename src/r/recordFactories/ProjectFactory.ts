
import { variableTypeToDefn } from "../definitions/variables";
import {
  predefinedVariableDefaults,
  PredefinedVariableName,
  VarCategory,
  VariableType,
  variableTypeDefaults,
} from "../definitions/variables/VariableTypes";
import { RecordFactory } from "../R/RecordFactory";
import { ClipboardData, createRecord, idAndRecord, idOrAddress, RecordMap, RecordNode } from "../R/RecordNode";
import { RT, rtp } from "../R/RecordTypes";
import { SceneFactory } from "./SceneFactory";
import { jsUtils } from "@gmetrixr/gdash";
import { ElementFactory } from "./ElementFactory";
import { en, fn } from "../definitions";
import { ProjectProperty } from "../recordTypes/Project";
import { ElementProperty } from "../recordTypes/Element";
import { ItemProperty } from "../recordTypes/Item";
import { OptionProperty } from "../recordTypes/Options";
import { ShoppingProperty } from "../recordTypes/Shopping";
import { MenuProperty } from "../recordTypes/Menu";
import { ElementType } from "../definitions/elements/ElementDefinition";
import { LeadGenFieldProperty } from "../recordTypes/LeadGenField";
import { SceneCollisionOptions, SceneType } from "../definitions/special";
import { sceneEnvironmentOptions } from "../definitions/special/SpecialTypes";

const { deepClone } = jsUtils;
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

  addElementRecord({record, position, id, dontCycleSubRecordIds, parentIdOrAddress, elementType}: {
    record?: RecordNode<RT>, position?: number, id?: number, dontCycleSubRecordIds?: boolean, parentIdOrAddress: idOrAddress, elementType: ElementType
  }): idAndRecord<RT.element> | undefined {
    if(!record) {
      record = createRecord(RT.element);
    }
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
  addRecord({record, position, id, dontCycleSubRecordIds, parentIdOrAddress}: {
    record: RecordNode<RT>, position?: number, id?: number, dontCycleSubRecordIds?: boolean, parentIdOrAddress?: idOrAddress
  }): idAndRecord<RT> | undefined {
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
  private refreshRecordsLinkedToScene(sceneIdAndRecord: idAndRecord<RT.scene>) {
    //Add menu entry. Calling super.addBlankRecord and not ProjectFactory.addBlankRecord because internally it call addRecord, 
    //would end up in a cyclic call.
    const menuRecordId = sceneIdAndRecord.id + 10001;
    const menuRecordPresent = this.getRecord(menuRecordId, RT.menu) as RecordNode<RT.menu>;
    if(menuRecordPresent === undefined) {
      const newMenuRecord = super.addBlankRecord({type: RT.menu, id: menuRecordId});
      if(newMenuRecord) {
        newMenuRecord.record.props.menu_scene_id = sceneIdAndRecord.id;
        newMenuRecord.record.props.menu_show = this.getValueOrDefault(rtp.project.auto_add_new_scene_to_menu);
      }
    }

    const tourRecordId = sceneIdAndRecord.id + 10002;
    const tourRecordPresent = this.getRecord(tourRecordId, RT.tour_mode) as RecordNode<RT.tour_mode>;
    if(tourRecordPresent === undefined) {
      // Adding scene details every time to menu prop and making the boolean menu_show true / false based on the value given or default which is true.
      if (this.getValueOrDefault(rtp.project.auto_add_new_scene_to_tour_mode) === true) {
        //Making id deterministic (although not needed) - for testing
        const tourModeRecord = super.addBlankRecord({type: RT.tour_mode, id: tourRecordId});
        if(tourModeRecord) {
          (tourModeRecord.record as RecordNode<RT.tour_mode>).props.tour_mode_scene_id = sceneIdAndRecord.id;
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
    }
  }

  deleteRecord<N extends RT>(id: number, type?: N): idAndRecord<RT> | undefined {
    const idAndRecord = super.deleteRecord(id, type);
    this.afterDeleteInProjectFactory(idAndRecord);
    return idAndRecord;
  }

  deleteDeepRecord<T>(idOrAddress: idOrAddress): idAndRecord<RT> | undefined {
    const idAndRecord = super.deleteDeepRecord(idOrAddress);
    this.afterDeleteInProjectFactory(idAndRecord);
    return idAndRecord;
  }

  private afterDeleteInProjectFactory(idAndRecord?: idAndRecord<RT>) {
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
    }
  }

  changeRecordName<N extends RT>(id: number, newName?: string, type?: N): idAndRecord<RT> | undefined {
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

  updateRecordsLinkedToVariableTemplate(variableIdAndRecord: idAndRecord<RT.variable>, oldName: string) {
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

const varNameFromOriginName = (originName: string | undefined): string => `${originName}_var`;

export class ProjectUtils {
  static addNewScene(project: RecordNode<RT.project>, sceneType: SceneType) {
    const projectF = new ProjectFactory(project);
    const sceneIdAndRecord = projectF.addBlankRecord({type: RT.scene});
    if(!sceneIdAndRecord) return undefined;
    const sceneF = new SceneFactory(sceneIdAndRecord.record);
    sceneF.set(rtp.scene.scene_type, sceneType);
    const sceneId = sceneIdAndRecord.id;

    // * Add a default pano
    projectF.addElementRecord({
      parentIdOrAddress: sceneId,
      elementType: ElementType.pano_image
    });

    if(sceneType === SceneType.six_dof) {
      sceneF.set(rtp.scene.scene_collision_type, SceneCollisionOptions.advanced_collision);
      // * Add a default environment
      const env = projectF.addElementRecord({parentIdOrAddress: sceneId, elementType: ElementType.object_3d});

      if(env) {
        const elementF = new ElementFactory(env.record);
        sceneF.changeRecordName(env.id, "Environment", RT.element);
        elementF.set(rtp.element.source, sceneEnvironmentOptions[0].source);
        elementF.set(rtp.element.scale, sceneEnvironmentOptions[0].scale);
        elementF.set(rtp.element.placer_3d, sceneEnvironmentOptions[0].placer_3d);
        elementF.set(rtp.element.locked, true);
        sceneF.set(rtp.scene.scene_bounds, sceneEnvironmentOptions[0].scene_bounds);
      }

      // * Add a spawn zone
      const zone = projectF.addElementRecord({parentIdOrAddress: sceneId, elementType: ElementType.zone});
      // * Reset the placer 3D for this zone element
      if(zone) {
        const elementF = new ElementFactory(zone.record);
        const defaultPlacer3D = elementF.getDefault(rtp.element.placer_3d);
        elementF.set(rtp.element.placer_3d, defaultPlacer3D);
      }

      const zoneElementId = zone?.id;
      const envElementId = env?.id;

      // * Assign the spawn zone to the scene
      sceneF.set(rtp.scene.scene_spawn_zone_id, zoneElementId);
      // * Add default light rig
      ProjectUtils.addDefaultLightRig(project, sceneId, envElementId);
    } else {
      // * Add default light rig
      ProjectUtils.addDefaultLightRig(project, sceneId);
    }
  }

  static addDefaultLightRig(project: RecordNode<RT.project>, sceneId: number, envElementId?: number) {
    const projectF = new ProjectFactory(project);
    const group = projectF.addElementRecord({parentIdOrAddress: sceneId, elementType: ElementType.group});
    const useLegacyColorManagement = projectF.getValueOrDefault(rtp.project.use_legacy_color_management) as boolean;
    if(group) {
      group.record.name = `Lights`;
      const groupF = new ElementFactory(group.record);
      // add light rig to this groups
      const ambientLight = groupF.addElementOfType(en.ElementType.light);
      ambientLight.name = "Ambient Light";

      const ambientLightF = new ElementFactory(ambientLight);
      ambientLightF.set(rtp.element.light_type, en.lightType.ambient);
      ambientLightF.set(rtp.element.color, "#FFFFFF");
      ambientLightF.set(rtp.element.intensity, useLegacyColorManagement? 1: 3);

      const directionalLight = groupF.addElementOfType(en.ElementType.light);
      directionalLight.name = "Directional Light";

      const directionalLightF = new ElementFactory(directionalLight);
      directionalLightF.set(rtp.element.light_type, en.lightType.directional);
      directionalLightF.set(rtp.element.color, "#FFFFFF");
      directionalLightF.set(rtp.element.intensity, useLegacyColorManagement? 0.6: 3);
      directionalLightF.set(rtp.element.placer_3d, [0, 12, 4, 0, 0, 0, 1, 1, 1]);
      directionalLightF.set(rtp.element.target_element_id, envElementId);
    }
  }
}
