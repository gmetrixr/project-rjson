import { flatten, uniq, values } from "ramda";
import { isVariableType, predefinedVariableIdToName, variableTypeToDefn } from "../definitions/variables";
import {
  predefinedVariableDefaults,
  PredefinedVariableName,
  VarCategory,
  VariableType,
  variableTypeDefaults,
} from "../definitions/variables/VariableTypes";
import { RecordFactory, idAndRecord, idOrAddress } from "../R/RecordFactory";
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
import { RuleAction } from "../definitions/rules";
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
    const templatableElements = [ElementType.text, ElementType.embed_html];
    const templatableRulesActions = [RuleAction.open_url];
    const newName = variableIdAndRecord.record.name;
    if(newName) {
      const deepRecords = this.getDeepRecordEntries();
      for(const [id, record] of deepRecords) {
        switch(record.type) {
          case RT.element: {
            const eType = (record as RecordNode<RT.element>).props.element_type as en.ElementType;
            if(templatableElements.includes(eType)) {
              this.updateStringTemplateInRecord(record, oldName, newName);
            }
          }
          case RT.then_action: {
            const action = (record as RecordNode<RT.then_action>).props.action as RuleAction;
            if(templatableRulesActions.includes(action)) {
              this.updateStringTemplateInRecord(record, oldName, newName);
            }
          }
          default:
            return false;
        }
      }
    }
  }

  updateStringTemplateInRecord(record: RecordNode<RT>, oldVarName: string, newVarName: string) {
    const searchValue = new RegExp(`({{[s]*${oldVarName}[s]*}})+`, "gm");
    const replaceValue = `{{${newVarName}}}`;
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
   * Scene copy logic:
   * In scene rules, vars can be referenced via ids or via variable names (in templates used in elements)
   * Copy all variables referenced.
   * @param ids - list of ids for child records
   */
  copyToClipboardObject(ids: number[]): ClipboardR {
    const baseClipboardObject = super.copyToClipboardObject(ids);
    /**
     * Parse through the extracted records to check if any variable needs to be added to the clipboard object
     * 1. find all variables used
     *  1.1 directly in rules (when events and then actions)
     *  1.2 indirectly as templates in when_events, then_actions and text element
     */

    // * create a map of all possible variable names to look through in rules
    const varDefROM = this.getROM(RT.variable) ?? emptyROM<RT.variable>();
    const idNameMap: { [key: number]: string } = {};

    for (const vDef of Object.values(varDefROM.map)) {
      //If predefined var, get name from definitions. Predefined vars definitions don't need to be present in the project json
      if (predefinedVariableIdToName[vDef.id] !== undefined) {
        idNameMap[vDef.id] = predefinedVariableIdToName[vDef.id]; //Predefined variable type is also the name
      } {
        idNameMap[vDef.id] = vDef.name as string;
      }
    }

    // * using a Set here to store var ids since Set handles uniqueness in entries
    const varsSet = new Set();
    /**
     * variable can be used in the following places:
     * 1. rules on variables - straightforward, find all when events and then actions on variables
     * 2. when event / then action properties templating - find all when events and then actions with properties.length > 0 and find variables that are templated
     * 3. text element templating - look through all text elements and find variables used in templating
     */
    baseClipboardObject.nodes
      .filter(rn => rn.type === RT.scene)
      .forEach((current) => {
        const recordF = new SceneFactory(current);

        // * get all when events that use variables or have properties defined
        recordF
          .getAllDeepChildrenWithFilter(RT.when_event, (r) =>
            isVariableType(r.props.co_type as VariableType) ||
            ((r.props.properties || []) as unknown[]).length > 0)
          .forEach(r => {
            // * if the cog object is a variable type, blindly add to our list
            if (isVariableType(r.props.co_type as VariableType)) {
              varsSet.add(r.props.co_id)
            }

            /**
             * * now check if the properties arr contains any variables.
             * ! NOTE: that this is not an else condition since there can be 2 variables used in a single when event:
             * ! 1. as cog object
             * ! 2. as variable name template
             *
             * varsSet will take care of unique entries
             */
            const properties = (r.props.properties || []) as any[];
            // * properties = ["{{score}}", "{{number}}+{{string}}"] score, number and string are all variable names
            // * the loop has to be on the variable names since the names can be used in a formula too and not just plain templating
            for (const [key, value] of Object.entries(idNameMap)) {
              // check if any of the names is included in the properties array entries
              for (const p of properties) {
                if (p.toString().includes(value)) {
                  varsSet.add(Number(key));
                }
              }
            }
          });

        // * get all then actions that use variables or have properties defined
        recordF
          .getAllDeepChildrenWithFilter(RT.then_action, (r) =>
            isVariableType(r.props.co_type as VariableType) ||
            ((r.props.properties || []) as unknown[]).length > 0)
          .forEach(r => {
            // * if the cog object is a variable type, blindly add to our list
            if (isVariableType(r.props.co_type as VariableType)) {
              varsSet.add(r.props.co_id)
            }

            /**
             * * now check if the properties arr contains any variables.
             * ! NOTE: that this is not an else condition since there can be 2 variables used in a single then action:
             * ! 1. as cog object
             * ! 2. as variable name template
             *
             * varsSet will take care of unique entries
             */
            const properties = (r.props.properties || []) as any[];
            // * properties = ["{{score}}", "{{number}}+{{string}}"] score, number and string are all variable names
            // * the loop has to be on the variable names since the names can be used in a formula too and not just plain templating
            for (const [key, value] of Object.entries(idNameMap)) {
              // check if any of the names is included in the properties array entries
              for (const p of properties) {
                if (p.toString().includes(value)) {
                  varsSet.add(Number(key));
                }
              }
            }
          });

        // * find all variables templated in text elements. ONLY text ELEMENTS CAN BE TEMPLATED AS OF NOW
        recordF.getAllDeepChildrenWithFilter(RT.element, (r) => r.props.element_type === ElementType.text)
          .forEach((r) => {
            const text = (r.props?.text ?? "") as string;
            // * text = ["{{score}}", "{{number}}+{{string}}"] score, number and string are all variable names
            for (const [key, value] of Object.entries(idNameMap)) {
              if (text.includes(value)) {
                varsSet.add(Number(key));
              }
            }
          });
      });

    const varsUsed = Array.from(varsSet);
    const varsDef = this.getAllDeepChildrenWithFilter(RT.variable, (r) => varsUsed.includes(r.id));
    baseClipboardObject.nodes.push(...varsDef);
    return baseClipboardObject;
  }

  /**
   * Variable paste logic: [FYI: Variables only get copied when a scene(s) is using them]
   * For EACH variable which was copied
   * - If the variable id and name doesn't exist - paste it (1)
   * - If the variable id exists, but name doesn't - ignore it. (2) (To make this work, we need to go to each string template used in rules
   * and elements in the new scene, and change the templates to use the new name)
   * - If the variable id doesn't exist, but name does (3) - replace the variable id in the new scene being pasted (in all rules)
   * with the new variable id
   * - If both the variable id and name exist - ignore it (4)
   * @param obj
   * @param position
   */
  pasteFromClipboardObject({ obj, position, groupElementId, sceneId }: { obj: ClipboardR, position?: number, groupElementId?: number, sceneId?: number }): void {
    if (obj.parentType === RT.scene && sceneId === undefined) {
      console.error(`Can't paste an element at project level. Please provide a sceneId.`);
      return;
    }
    const projectVars = this.getRecords(RT.variable);
    const scenesFromClipboard = obj.nodes.filter(s => s.type === RT.scene);
    const variablesFromClipboard = obj.nodes.filter(s => s.type === RT.variable);
    const otherRecordsFromClipboard = obj.nodes.filter(s => s.type !== RT.variable && s.type !== RT.scene && s.type !== RT.element);
    const elementsFromClipboard = obj.nodes.filter(s => s.type === RT.element)

    for (const rn of variablesFromClipboard) {
      // This needs to follow the pasting logic above
      const variable = this.getRecord(RT.variable, rn.id);
      if (variable === undefined) {
        // ! variable doesn't exist
        // * check if one with the same name exists or not.
        const nameMatchedVariable = projectVars.find(v => v.name === rn.name);
        if (nameMatchedVariable) {
          // * (3) there exists a variable with the same name, we replace ids of rn in any new scenes being pasted with the one already present in the project
          // * Only replace in rules since templating uses names and will continue using them
          // ! Only replace in the scenes being pasted. If there are no scenes to be pasted, this will be a no-op
          for (const scene of scenesFromClipboard) {
            const sceneF = new SceneFactory(scene);

            // ! using getAllDeepChildrenWithFilter here to filter results and avoid unnecessary loops
            // * find the when event that is using the variable that is being pasted, also ensure that we are modifying only when type of vars match
            const whenEvents = sceneF.getAllDeepChildrenWithFilter(RT.when_event, we => we.props.co_type === nameMatchedVariable.props.var_type && we.props.co_id === rn.id);
            // * find the then action that is using the variable that is being pasted, also ensure that we are modifying only when type of vars match
            const thenActions = sceneF.getAllDeepChildrenWithFilter(RT.then_action, ta => ta.props.co_type === nameMatchedVariable.props.var_type && ta.props.co_id === rn.id);

            for (const we of whenEvents) {
              we.props.co_id = nameMatchedVariable.id;
            }

            for (const ta of thenActions) {
              ta.props.co_id = nameMatchedVariable.id;
            }
          }
        } else {
          // * (1) neither the variable exists nor another variable with same name
          this.addRecord(rn);
        }
      } else {
        // * (4) if copied variable is present and name matches then ignore it.
        // * (2) When variable exists but names doesn't the ignore
        // * Both above are dependant on the fact the variable exists. If variable exists, then simply skip
        // ! this is a no-op
      }
    }

    // * add all scenes
    for (const scene of scenesFromClipboard) {
      // ! Only scenes are inserted in place when position is passed. Have to live with this assumption for now
      // * if position is passed, then keep incrementing to insert in order, else add at the end of the list
      const addedScene = this.addRecord(scene, position ? position++ : position);
      const sceneF = new SceneFactory(addedScene);
      const elements = sceneF.getAllDeepChildrenWithFilter(RT.element, e => en.elementsWithLinkedVariables.includes(e.props.element_type as ElementType));
      this.addLinkedVariables(elements);
    }

    // * add all other records
    for (const other of otherRecordsFromClipboard) {
      // keep adding to the end of the list
      this.addRecord(other);
    }

    if (sceneId !== undefined && elementsFromClipboard.length > 0) {
      const scene = this.getRecord(RT.scene, sceneId);
      const sceneF = new SceneFactory(scene as RecordNode<RT.scene>);
      if (groupElementId !== undefined) {
        const group = sceneF.getAllDeepChildrenWithFilter(RT.element, el => el.id === groupElementId);
        if (group !== undefined) {
          const groupF = new ElementFactory(group[0]);
          const addedRecords = groupF.pasteFromClipboardObject({ obj, position });
          const recordsToAddLinkedVars = this.getAllRecordsForLinkedVariables(addedRecords as RecordNode<RT>[]);
          this.addLinkedVariables(recordsToAddLinkedVars as RecordNode<RT>[]);
        }
      } else {
        const addedRecords = sceneF.pasteFromClipboardObject({ obj, position, groupElementId });
        const recordsToAddLinkedVars = this.getAllRecordsForLinkedVariables(addedRecords as RecordNode<RT>[]);
        this.addLinkedVariables(recordsToAddLinkedVars as RecordNode<RT>[]);
      }
    }
  }

  getAllRecordsForLinkedVariables(records: RecordNode<RT>[]) {
    const recordsToAddLinkedVars: RecordNode<RT.element>[] = [];

    for (const record of records) {
      switch (record?.props.element_type) {
        case en.ElementType.group: {
          const recordGroupF = new ElementFactory(record);
          const allGroupChildrenWithLinkedVariables = recordGroupF.getAllDeepChildrenWithFilter(RT.element, e => en.elementsWithLinkedVariables.includes(e?.props.element_type as ElementType));
          recordsToAddLinkedVars.push(...allGroupChildrenWithLinkedVariables);
          break;
        }

        default: {
          if (en.elementsWithLinkedVariables.includes(record?.props.element_type as ElementType)) {
            recordsToAddLinkedVars.push(record as RecordNode<RT>);
          }
          break;
        }
      }
    }

    return recordsToAddLinkedVars;
  }

  /**
   * Overriding this function from base class as there is element specific code.
   * Check base class implementation for reference on function usage and examples
   */
  reParentRecordsWithAddress(destParentAddr: string, sourceRecordAddr: { parentAddr: string, recordAddr: string }[], destPosition?: number): [RecordNode<RT>[], RecordNode<RT>[]] {
    const destParentRecord = this.getRecordAtAddress(destParentAddr);
    const reParentedRecords: RecordNode<RT>[] = [];
    const failedReParentedRecords: RecordNode<RT>[] = [];

    if (destParentRecord === null) {
      console.error(`[reParentRecordsWithAddress]: Error in re-parenting. destParentAddr: ${destParentAddr}`);
      return [reParentedRecords, failedReParentedRecords];
    }

    const destinationParentRecordF = new RecordFactory(destParentRecord);
    for (const s of sourceRecordAddr) {
      const sourceRecord = this.getRecordAtAddress(s.recordAddr);
      const sourceParentRecord = this.getRecordAtAddress(s.parentAddr);
      if (sourceRecord === null || sourceParentRecord === null) {
        console.error(`[delete-sourceRecordAddresses]: can't find record/parent for : recordAddr: ${s.recordAddr} parentAddr: ${s.recordAddr}`);
        continue;
      }

      /**
       * The order of operations here is very important
       * 1. add the record in the new parent
       * 2. delete the record from older parent
       *
       * We do this in this order and not reverse since there can be records that don't qualify to be child of a parent
       * for ex: a scene can't be a child of a group
       * in this case, we don't re-parent the record at all and addRecord function returns undefined.
       * A better UX for this would be to restrict the user to be able to do that at all in the UI
       *
       */

      /**
       * Almost all operations are generic baring one: re-parenting groups into other groups. We don't support this functionality yet.
       * So a special check needs to be made when sourceRecord and destParentRecord both have ** type === element **
       * we need to check that sourceRecord.props.element_type !== group, only then allow re-parenting
       */
      if (sourceRecord.type === RT.element && destParentRecord.type === RT.element) {
        const sourceRecordElementType = sourceRecord.props.element_type;
        const destParentRecordElementType = sourceRecord.props.element_type;
        if (destParentRecordElementType === en.ElementType.group && sourceRecordElementType === en.ElementType.group) {
          failedReParentedRecords.push(sourceRecord);
          continue;
        }
      }

      // * Add to destination parent
      // * addRecord takes care of name clashes and id clashes
      const addedRecord = destinationParentRecordF.addRecord(sourceRecord, destPosition);
      // * Record was added correctly to the appropriate parent
      if (addedRecord !== undefined) {
        // * delete the record from resp parents
        const sourceParentRecordF = new RecordFactory(sourceParentRecord);
        sourceParentRecordF.deleteRecord(sourceRecord.type as RT, sourceRecord.id);
        reParentedRecords.push(addedRecord);
      } else {
        failedReParentedRecords.push(sourceRecord);
      }
    }
    return [reParentedRecords, failedReParentedRecords];
  }

  /**
   * This method is called from the UI to resolve inconsistencies in the menu records.
   * It is called only if the number of menu entries != number of scene entries
   */
  syncMenuWithScenes(): void {
    const sceneIdsSet = new Set(this.getRecords(RT.scene).map(s => s.id));
    const sceneIdsFroMenuSet = new Set(this.getRecords(RT.menu).map(m => m.props.menu_scene_id as number));
    //If both above sets are equal, return.
    //Set equality test is (union's length = intersection's length)
    if (union(sceneIdsSet, sceneIdsFroMenuSet).size ===
      intersection(sceneIdsSet, sceneIdsFroMenuSet).size) {
      return;
    }
    //For scenes in MenuList, but not in SceneList, delete them from menu
    const toBeRemovedFromMenu = difference(sceneIdsFroMenuSet, sceneIdsSet);
    //For scenes in SceneList, but not in MenuList, add them to menu
    const toBeAddedToMenu = difference(sceneIdsSet, sceneIdsFroMenuSet);

    for (const sid of toBeRemovedFromMenu.values()) {
      //Find which menu record is to be removed
      const removeMenuRecords = this.getRecords(RT.menu).filter(m => m.props.menu_scene_id === sid);
      for (const mr of removeMenuRecords) {
        this.deleteRecord(RT.menu, mr.id);
      }
    }

    for (const sid of toBeAddedToMenu.values()) {
      const menuRecord = super.addBlankRecord(RT.menu, sid + 10001);
      menuRecord.props.menu_scene_id = sid;
      //Because this is the fix of an error, don't surprise users with extra menu entries
      menuRecord.props.menu_show = false;
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
    const scene = projectF.getRecord(RT.scene, sceneId);

    if (scene) {
      const sceneF = new SceneFactory(scene);
      const rules = sceneF.getRecords(RT.rule);

      for (const rule of rules) {
        const ruleF = new RecordFactory(rule);

        const ruleName = ruleF.getName()?.trim().toLowerCase();
        const accentColor = (ruleF.getValueOrDefault(rtp.rule.accent_color) as string).trim().toLowerCase();
        const ruleId = ruleF.getId();

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
        const elements = sceneF.getAllDeepChildren(RT.element);
        const whenEvents = ruleF.getRecords(RT.when_event);

        for (const we of whenEvents) {
          const coId = we.props.co_id as number;
          const element = elements.find(ele => ele.id === coId);
          const variable = projectF.getRecord(RT.variable, coId);
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
          const element = elements.find(ele => ele.id === coId);
          const variable = projectF.getRecord(RT.variable, coId);

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
                const element = elements.find(ele => ele.id === elem_id);
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
                const scene = projectF.getRecord(RT.scene, sceneId);
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
                const items = sceneF.getAllDeepChildrenWithFilter(RT.item, (ele => ele.id === itemId));

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
    const elementRecords = projectF.getAllDeepChildrenWithFilter(RT.element, e => templatableElements.includes(e.props.element_type as ElementType));
    const ruleRecords = projectF.getAllDeepChildrenWithFilter(RT.then_action, ta => templatableRulesActions.includes(ta.props.action as RuleAction));
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
