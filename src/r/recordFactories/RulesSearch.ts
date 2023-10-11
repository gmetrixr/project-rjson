import { RT, RecordFactory, RecordNode, rtp } from "../R";
import { RuleAction } from "../definitions/rules";
import { ProjectFactory } from "./ProjectFactory";
import { SceneFactory } from "./SceneFactory";
import { jsUtils } from "@gmetrixr/gdash";
import { flatten, uniq } from "ramda";

export class RulesSearch {
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
      for (const [ruleId, rule] of sceneF.getRecordEntries(RT.rule)) {
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
          const coId = we.props.we_co_id as number;
          const element = elementEntries.find(([eId, ele]) => eId === coId);
          const variable = projectF.getRecord(coId, RT.variable);
          if (element) {
            const eleName = element[1].name?.trim().toLowerCase();
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
          const coId = ta.props.ta_co_id as number;
          const element = elementEntries.find(([eId, ele]) => eId === coId);
          const variable = projectF.getRecord(coId, RT.variable);

          if (element) {
            const eleName = element[1].name?.trim().toLowerCase();
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
            case RuleAction.change_view_mode:
            case RuleAction.add_number: {
              if (Array.isArray(ta.props.ta_properties)) {
                for(const p of ((ta.props.ta_properties ?? []) as string[])) {
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
              if (Array.isArray(ta.props.ta_properties)) {
                const elem_id = ta.props.ta_properties[0] as number;
                const element = elementEntries.find(([eId, ele]) => eId === elem_id);
                if(element) {
                  const elementName = element[1]?.name?.trim().toLowerCase();
  
                  if (elementName) {
                    this.propsNameDict[elementName] ?
                      this.propsNameDict[elementName].push(ruleId) :
                      this.propsNameDict[elementName] = [ruleId];
                  }
                }
              }

              break;
            }

            case RuleAction.change_scene: {
              if (Array.isArray(ta.props.ta_properties)) {
                const sceneId = ta.props.ta_properties[0] as number;
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
              if (Array.isArray(ta.props.ta_properties)) {
                const itemId = ta.props.ta_properties[0] as number;
                const itemEntries = sceneF.getDeepRecordEntries(RT.item).filter(([id, item]) => id === itemId);
                
                for(const [id, item] of itemEntries) {
                  const itemName = item.name?.trim().toLowerCase();
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
      this.accentColorsDict[accentColor.toLowerCase()] || [] :
      flatten(Object.values(this.accentColorsDict));

    if (accentColor && idsForAccentColor && !searchString) {
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
}
