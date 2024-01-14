import chalk from "chalk";
import { rActionDisplayName, rEventDisplayName, RuleAction, RuleEvent } from "./index.js";
import { idAndRecord, RecordMap, RecordNode, RT, rtp } from "../../../r/index.js";
import { RecordFactory } from "../../R/index.js";
import { ProjectFactory, SceneFactory,  } from "../../recordFactories/index.js";
import { ElementUtils } from "../../recordFactories/ElementUtils.js";
import { isElementType, ElementType } from "../elements/index.js";
import { isSpecialType, specialElementDisplayNames, SpecialType } from "../special/index.js";
import { ArrayOfValues, isVariableType } from "../variables/index.js";
import { CogObjectType } from "../index.js";

export interface RuleText {
  ruleIdText: string;
  weTexts: string[];
  weAndOr: "AND" | "OR" | "and" | "or";
  taTexts: string[];
}

/**
 * Separating out this class as this doesn't need to be included in production and also,
 * because this imports potentially heavy "chalk" dependency
 */
export class rulePrintUtils {
  /** Get an instance of Console Rule Printer */
  static crp = (): ConsoleRulePrinter => ConsoleRulePrinter.getInstance();
  /** Get an instance of Friendly Rule Printer */
  static frp = (): FriendlyRulePrinter => FriendlyRulePrinter.getInstance();

  static generateRuleTextsAndPrint = (
    scene: RecordNode<RT.scene>,
    varMap: RecordMap<RT.variable> = {},
  ): void => {
    let ruleText;
    const sceneF = new SceneFactory(scene);
    for (const [ruleId, rule] of sceneF.getRecordEntries(RT.rule)) {
      ruleText = rulePrintUtils.crp().generateRuleText({id: ruleId, record: rule}, scene, varMap);
      rulePrintUtils.crp().consoleRuleTextPrinter(ruleText);
    }
  };

  static generateFriendlyRuleTextsAndPrint = (project: RecordNode<RT.project>, sceneIds: number[]): void => {
    const projectF = new ProjectFactory(project);
    const varDefROM = projectF.getRecordMap(RT.variable);
    for (const sceneId of sceneIds) {
      const scene = projectF.getRecord(sceneId, RT.scene);
      if (scene !== undefined) {
        rulePrintUtils.frp().generateRuleTextsAndPrint(project, scene, varDefROM);
      }
    }
  };

  static generateFriendlyRuleTexts = (project: RecordNode<RT.project>, sceneIds: number[]): string => {
    const projectF = new ProjectFactory(project);
    const varDefROM = projectF.getRecordMap(RT.variable);
    let rulesText = "";
    const frp = rulePrintUtils.frp();
    for (const sceneId of sceneIds) {
      const scene = projectF.getRecord(sceneId, RT.scene);
      if (scene !== undefined) {
        const sceneF = new SceneFactory(scene);
        for (const rule of sceneF.getRecords(RT.rule)) {
          const ruleText = frp.generateRuleText(rule, project, scene, varDefROM);
          rulesText += frp.friendlyRuleLine(ruleText);
          rulesText += "\n"; // new line
        }
      }
    }
    return rulesText;
  };
}

/**
 * Use this class via the singleton getter
 * Eg: ConsoleRulePrinter.getInstance().doSomething....
 */
class ConsoleRulePrinter {
  public static getInstance = () => {
    if (ConsoleRulePrinter.instance === undefined) {
      ConsoleRulePrinter.instance = new ConsoleRulePrinter();
    }
    return ConsoleRulePrinter.instance;
  };
  private static instance: ConsoleRulePrinter;

  public generateRuleTextsAndPrint = (
    scene: RecordNode<RT.scene>,
    varMap: RecordMap<RT.variable> = {},
  ): void => {
    let ruleText;
    const sceneF = new SceneFactory(scene);
    for (const [ruleId, rule] of sceneF.getRecordEntries(RT.rule)) {
      ruleText = this.generateRuleText({id: ruleId, record: rule}, scene, varMap);
      this.consoleRuleTextPrinter(ruleText);
    }
  };

  public generateRuleText = (
    rule: idAndRecord<RT.rule>,
    scene: RecordNode<RT.scene>,
    varMap: RecordMap<RT.variable> = {},
  ): RuleText => {
    const rf = new RecordFactory(rule.record);
    const whenEventsArray: string[] = [];
    const thenActionsArray: string[] = [];
    rf.getRecords(RT.when_event).forEach(whenEvent => {
      //whenEventsArray.push(`${whenEvent.ce_type}(${whenEvent.ce_id}) ${cEventsDisplayNames[<ConnectionEvent>whenEvent.event]} ${whenEvent.properties}`.trim());
      whenEventsArray.push(this.weText(whenEvent, scene, varMap));
    });
    rf.getRecords(RT.then_action).forEach(thenAction => {
      //thenActionsArray.push(`${thenAction.ce_type}(${thenAction.ce_id}) should ${cActionsDisplayNames[<ConnectionAction>thenAction.action]} ${thenAction.properties}`.trim());
      thenActionsArray.push(this.taText(thenAction, scene, varMap));
    });
    return {
      ruleIdText: this.ruleIdText(rule),
      weTexts: whenEventsArray,
      weAndOr: rf.get(rtp.rule.events_and) ? "AND" : "OR",
      taTexts: thenActionsArray,
    };
  };

  public consoleRuleTextPrinter = (ruleText: RuleText): void => {
    console.log(`${chalk.yellow.bold("RULE".padStart(5).padEnd(6))}${chalk.yellow(ruleText.ruleIdText)}`);
    let startText;
    for (let i = 0; i < ruleText.weTexts.length; i++) {
      startText = i === 0 ? "WHEN" : ruleText.weAndOr;
      console.log(`${chalk.green.bold(startText.padStart(5).padEnd(6))}${chalk.green(ruleText.weTexts[i])}`);
    }
    for (let i = 0; i < ruleText.taTexts.length; i++) {
      startText = i === 0 ? "THEN" : "AND";
      console.log(`${chalk.blue.bold(startText.padStart(5).padEnd(6))}${chalk.blue(ruleText.taTexts[i])}`);
    }
  };

  public ruleIdText = (ruleIdAndRecord: idAndRecord<RT.rule>): string => {
    return `${ruleIdAndRecord.record.name}(${ruleIdAndRecord.id}) ${ruleIdAndRecord.record.props.comment ?? ""}`;
  };

  public weText = (
    we: RecordNode<RT.when_event>,
    scene: RecordNode<RT.scene>,
    varMap: RecordMap<RT.variable> = {},
    values?: ArrayOfValues,
  ): string => {
    const displayName = this.coIdToName(we.props.we_co_id as number, we.props.we_co_type as CogObjectType, scene, varMap);
    const event = rEventDisplayName[<RuleEvent>we.props.event];
    let propertiesText = "";
    if (we.props.we_properties !== undefined && (we.props.we_properties as ArrayOfValues).length !== 0) {
      propertiesText = `[${(we.props.we_properties as ArrayOfValues)?.join(",")}]`;
    }
    let valuesText = "";
    if (values !== undefined && values.length !== 0) {
      valuesText = ` values[${values.join(",")}]`;
    }
    return `${displayName} ${event}${propertiesText}${valuesText}`;
  };

  public taText = (
    ta: RecordNode<RT.then_action>,
    scene: RecordNode<RT.scene>,
    varMap: RecordMap<RT.variable> = {},
    values?: ArrayOfValues,
  ): string => {
    const displayName = this.coIdToName(ta.props.ta_co_id as number, ta.props.ta_co_type as CogObjectType, scene, varMap);
    const action = rActionDisplayName[<RuleAction>ta.props.action];
    let propertiesText = "";
    if (ta.props.ta_properties !== undefined && (ta.props.ta_properties as ArrayOfValues).length !== 0) {
      propertiesText = `[${(ta.props.ta_properties as ArrayOfValues)?.join(",")}]`;
    }
    let valuesText = "";
    if (values !== undefined && values.length !== 0) {
      valuesText = ` values[${values.join(",")}]`;
    }
    let delayText = "";
    if (ta.props.ta_delay !== undefined && ta.props.ta_delay !== 0) {
      delayText = ` after ${ta.props.ta_delay}s`;
    }
    return `${displayName} should ${action}${propertiesText}${valuesText}${delayText}`;
  };

  private coIdToName = (
    coId: number,
    coType: CogObjectType,
    scene: RecordNode<RT.scene>,
    varMap: RecordMap<RT.variable> = {},
  ): string => {
    let name = "";
    let type = "UnknownType";
    if (isSpecialType(coType)) {
      type = specialElementDisplayNames[coType];
      if (coType === SpecialType.scene) {
        name = scene.name ?? "";
      }
    } else if (isVariableType(coType)) {
      type = coType;
      name = varMap[coId]?.name ?? "";
    } else if (isElementType(coType)) {
      type = ElementUtils.getElementDefinition(coType)?.elementDefaultName ?? "";
      const e = new RecordFactory<RT.scene>(scene).getDeepRecordEntries(RT.element).find(([eId, e]) => eId === coId);
      name = e?.[1]?.name ?? "";
    }
    if (name === "") {
      return `${type}(${coId})`;
    }
    return `${type} ${name}(${coId})`;
  };
}

/**
 * Use this class via the singleton getter
 * Eg: FriendlyRulePrinter.getInstance().doSomething....
 */
class FriendlyRulePrinter {
  public static getInstance = () => {
    if (FriendlyRulePrinter.instance === undefined) {
      FriendlyRulePrinter.instance = new FriendlyRulePrinter();
    }
    return FriendlyRulePrinter.instance;
  };
  private static instance: FriendlyRulePrinter;

  public generateRuleTextsAndPrint = (
    project: RecordNode<RT.project>,
    scene: RecordNode<RT.scene>,
    varMap: RecordMap<RT.variable> = {},
  ): void => {
    let ruleText;
    const sceneF = new SceneFactory(scene);
    for (const rule of sceneF.getRecords(RT.rule)) {
      ruleText = this.generateRuleText(rule, project, scene, varMap);
      console.log(this.friendlyRuleLine(ruleText));
    }
  };

  public generateRuleText = (
    rule: RecordNode<RT.rule>,
    project: RecordNode<RT.project>,
    scene: RecordNode<RT.scene>,
    varMap: RecordMap<RT.variable> = {},
  ): RuleText => {
    const rf = new RecordFactory(rule);
    const whenEventsArray: string[] = [];
    const thenActionsArray: string[] = [];
    rf.getRecords(RT.when_event).forEach(whenEvent => {
      whenEventsArray.push(this.weText(whenEvent, scene, varMap));
    });
    rf.getRecords(RT.then_action).forEach(thenAction => {
      thenActionsArray.push(this.taText(thenAction, project, scene, varMap));
    });
    return {
      ruleIdText: `${rule.name}${rule.props.comment ? " " + rule.props.comment : ""}`,
      weTexts: whenEventsArray,
      weAndOr: rf.get(rtp.rule.events_and) ? "and" : "or",
      taTexts: thenActionsArray,
    };
  };

  public friendlyRuleLine = (ruleText: RuleText): string => {
    const ruleStart = `RULE ${ruleText.ruleIdText}`;
    let ruleMid = "When ";
    for (let i = 0; i < ruleText.weTexts.length; i++) {
      ruleMid += i === 0 ? "" : ` ${ruleText.weAndOr} `;
      ruleMid += ruleText.weTexts[i];
    }
    let ruleEnd = "Then ";
    for (let i = 0; i < ruleText.taTexts.length; i++) {
      ruleEnd += i === 0 ? "" : " and ";
      ruleEnd += ruleText.taTexts[i];
    }
    const ruleS = `${ruleStart}: ${ruleMid} ${ruleEnd}`;
    return ruleS;
  };

  // * Used in cog to print matched triggerred events
  public weText = (
    we: RecordNode<RT.when_event>,
    scene: RecordNode<RT.scene>,
    varMap: RecordMap<RT.variable> = {},
    values?: ArrayOfValues,
  ): string => {
    const displayName = this.coIdToName(we.props.we_co_id as number, we.props.we_co_type as CogObjectType, scene, varMap);
    const event = rEventDisplayName[<RuleEvent>we.props.event];
    let propertiesText = "";
    if (we.props.we_properties !== undefined && (we.props.we_properties as ArrayOfValues).length !== 0) {
      propertiesText = `[${(we.props.we_properties as ArrayOfValues)?.join(",")}]`;
    }
    let valuesText = "";
    if (values !== undefined && values.length !== 0) {
      valuesText = ` values[${values.join(",")}]`;
    }
    return `${displayName} ${event}${propertiesText}${valuesText}`;
  };

  // * Used in cog to print matched triggerred actions
  public taText = (
    ta: RecordNode<RT.then_action>,
    project: RecordNode<RT.project>,
    scene: RecordNode<RT.scene>,
    varMap: RecordMap<RT.variable> = {},
    values?: ArrayOfValues,
  ): string => {
    const displayName = this.coIdToName(ta.props.ta_co_id as number, ta.props.ta_co_type as CogObjectType, scene, varMap);
    const action = rActionDisplayName[<RuleAction>ta.props.action];
    let propertiesText = "";
    //Calculate propertiesText based on the action type
    if (ta.props.ta_properties !== undefined && (ta.props.ta_properties as ArrayOfValues).length !== 0) {
      const properties = ta.props.ta_properties as ArrayOfValues;
      let coIdElement: number, e, coIdScene, propsScene;
      switch (ta.props.action) {
        case RuleAction.point_to:
          //properties[0] is the element id
          coIdElement = properties[0] as number;
          e = new RecordFactory<RT.scene>(scene).getDeepRecordEntries(RT.element).find(([id, element]) => id === coIdElement);
          propertiesText = this.coIdToName(
            properties[0] as number,
            e?.[1]?.props.element_type as ElementType,
            scene,
            varMap,
          );
          break;
        case RuleAction.change_scene:
          //properties[0] is the scene id
          coIdScene = properties[0] as number;
          propsScene = new ProjectFactory(project).getRecord(coIdScene, RT.scene);
          if (propsScene?.name !== undefined) {
            propertiesText = ` ${propsScene.name}`; //need a space before the scene name
          }
          break;
        default:
          propertiesText = `[${properties.join(",")}]`;
          break;
      }
    }
    //Values are needed only at runtime. Not while printing pre-existing rules
    let valuesText = "";
    if (values !== undefined && values.length !== 0) {
      valuesText = ` values[${values.join(",")}]`;
    }
    let delayText = "";
    if (ta.props.ta_delay !== undefined && ta.props.ta_delay !== 0) {
      delayText = ` after ${ta.props.ta_delay}s`;
    }
    return `${displayName} should ${action}${propertiesText}${valuesText}${delayText}`;
  };

  private coIdToName = (
    coId: number,
    coType: CogObjectType,
    scene: RecordNode<RT.scene>,
    varMap: RecordMap<RT.variable> = {},
  ): string => {
    let name = "";
    let type = "UnknownType";
    if (isSpecialType(coType)) {
      type = specialElementDisplayNames[coType];
      if (coType === SpecialType.scene) {
        name = scene.name ?? "";
      }
    } else if (isVariableType(coType)) {
      type = coType;
      name = varMap[coId]?.name ?? "";
    } else if (isElementType(coType)) {
      type = ElementUtils.getElementDefinition(coType)?.elementDefaultName ?? "";
      const e = new RecordFactory<RT.scene>(scene).getDeepRecordEntries(RT.element).find(([id, element]) => id === coId);
      name = e?.[1]?.name ?? "";
    }
    if (name === "") {
      return `${type}`;
    }
    return `${type} ${name}`;
  };
}
