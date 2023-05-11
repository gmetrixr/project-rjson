import { DeploymentProperty, deploymentPropertyDefaults } from "../recordTypes/Deployment";
import { WebhookProperty, webhookPropertyDefaults } from "../recordTypes/Webhook";
import { ProjectProperty, projectPropertyDefaults } from "../recordTypes/Project";
import { LeadGenFieldProperty, leadGenFieldPropertyDefaults } from "../recordTypes/LeadGenField";
import { MenuProperty, menuPropertyDefaults } from "../recordTypes/Menu";
import { VariableProperty, variablePropertyDefaults } from "../recordTypes/Variable";
import { SceneProperty, scenePropertyDefaults } from "../recordTypes/Scene";
import { RuleProperty, rulePropertyDefaults } from "../recordTypes/Rule";
import { WhenEventProperty, whenEventPropertyDefaults } from "../recordTypes/WhenEvent";
import { ThenActionProperty, thenActionPropertyDefaults } from "../recordTypes/ThenAction";
import { ElementProperty, elementPropertyDefaults } from "../recordTypes/Element";
import { OptionProperty, optionPropertyDefaults } from "../recordTypes/Options";
import { ShoppingProperty, shoppingPropertyDefaults } from "../recordTypes/Shopping";
import { ProductProperty, productPropertyDefaults } from "../recordTypes/Product";
import { ItemProperty, itemPropertyDefaults } from "../recordTypes/Item";
import { TourModeProperty, tourModePropertyDefaults } from "../recordTypes/TourMode";
import { LanguageProperty, languagePropertyDefaults } from "../recordTypes/Language";
import { AvatarProperty, avatarPropertyDefaults } from "../recordTypes/Avatar";
import { DiscussionProperty, discussionPropertyDefaults } from "../recordTypes/Discussion";
import { TopicProperty, topicPropertyDefaults } from "../recordTypes/Topic";
import { CommentProperty, commentPropertyDefaults } from "../recordTypes/Comment";

//https://stackoverflow.com/a/54178819/1233476
// type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>
// type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export const SINGLE_RECORD_ID = 1;

/** An enum of all RecordTypes */
export enum RT {
  "deployment" = "deployment",
  "webhook" = "webhook",
  "project" = "project",
  "menu" = "menu",
  "tour_mode" = "tour_mode",
  "lead_gen_field" = "lead_gen_field",
  "language" = "language",
  "variable" = "variable",
  "scene" = "scene",
  "rule" = "rule",
  "when_event" = "when_event",
  "then_action" = "then_action",
  "element" = "element",
  "item" = "item",
  "option" = "option",
  "shopping" = "shopping",
  "product" = "product",
  "avatar" = "avatar",
  "discussion" = "discussion",
  "topic" = "topic",
  "comment" = "comment",
}

/**
 * https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates
 * Useful while trying to use the ".type" property of an "untyped" json
 */
export function isRecordType(type: string): type is RT {
  return RT[(type as RT)] !== undefined;
}

export const rtHeirarchyTree = {
  "deployment": {
    "webhook": {},
  },
  "project": {
    "menu": {},
    "tour_mode": {},
    "language": {},
    "lead_gen_field": {},
    "variable": {},
    "avatar": {},
    "scene": {
      "rule": {
        "when_event": {},
        "then_action": {},
      },
      "element": {
        "element": { //Implies that element can be element's parent
          "element": {},
          "item": {
            "option": {},
          },
        },
      },
    },
    "shopping": {
      "product": {},
    },
  },
  "discussion": {
    "topic": {
      "comment": {}
    }
  }
}

/**
 * Record Type Properties Interface
 * Used to get to the enums (as a property) for typecasting
 */
export interface RTP {
  [RT.deployment]: DeploymentProperty,
  [RT.webhook]: WebhookProperty,
  [RT.project]: ProjectProperty,
  [RT.menu]: MenuProperty,
  [RT.tour_mode]: TourModeProperty,
  [RT.lead_gen_field]: LeadGenFieldProperty,
  [RT.language]: LanguageProperty,
  [RT.variable]: VariableProperty,
  [RT.scene]: SceneProperty,
  [RT.rule]: RuleProperty,
  [RT.when_event]: WhenEventProperty,
  [RT.then_action]: ThenActionProperty,
  [RT.element]: ElementProperty,
  [RT.item]: ItemProperty,
  [RT.option]: OptionProperty,
  [RT.shopping]: ShoppingProperty,
  [RT.product]: ProductProperty,
  [RT.avatar]: AvatarProperty,
  [RT.discussion]: DiscussionProperty,
  [RT.topic]: TopicProperty,
  [RT.comment]: CommentProperty,
}

/**
 * Record Type Properties object
 * Used to get to the enums (as an object) to select specific properties
 */
export const rtp = {
  [RT.deployment]: DeploymentProperty,
  [RT.webhook]: WebhookProperty,
  [RT.project]: ProjectProperty,
  [RT.menu]: MenuProperty,
  [RT.tour_mode]: TourModeProperty,
  [RT.lead_gen_field]: LeadGenFieldProperty,
  [RT.language]: LanguageProperty,
  [RT.variable]: VariableProperty,
  [RT.scene]: SceneProperty,
  [RT.rule]: RuleProperty,
  [RT.when_event]: WhenEventProperty,
  [RT.then_action]: ThenActionProperty,
  [RT.element]: ElementProperty,
  [RT.item]: ItemProperty,
  [RT.option]: OptionProperty,
  [RT.shopping]: ShoppingProperty,
  [RT.product]: ProductProperty,
  [RT.avatar]: AvatarProperty,
  [RT.discussion]: DiscussionProperty,
  [RT.topic]: TopicProperty,
  [RT.comment]: CommentProperty,
}

/**
 * RecordType Definitions
 * Contains all properties related to any RecordType
 */
export interface RTDefinition {
  /** Having this reference allows us to move up/down the tree to deduce parent/children record types */
  treeRef: Record<string, unknown>,
  /** If we go this type to the root, what are the other types we encounter in the heirarchy tree */
  typesInRootPath: RT[],
  defaultValues: Record<string, unknown>,
  /** Also indicates if this type uses "name". This is undefined if this type doesn't need a name */
  defaultName?: string,
}

/**
 * A map of all RecordType's Definitions
 */
export const recordTypeDefinitions: Record<RT, RTDefinition> = {
  [RT.deployment]: { 
    treeRef: rtHeirarchyTree.deployment,
    typesInRootPath: [],
    defaultValues: deploymentPropertyDefaults,
    //doesn't use name, so not defining defaultName
  },
  [RT.webhook]: { 
    treeRef: rtHeirarchyTree.deployment.webhook,
    typesInRootPath: [RT.deployment],
    defaultValues: webhookPropertyDefaults,
    //doesn't use name, so not defining defaultName
  },
  [RT.project]: { 
    treeRef: rtHeirarchyTree.project,
    typesInRootPath: [],
    defaultValues: projectPropertyDefaults,
    //doesn't use name, so not defining defaultName
  },
  [RT.menu]: { 
    treeRef: rtHeirarchyTree.project.menu,
    typesInRootPath: [RT.project],
    defaultValues: menuPropertyDefaults,
  },
  [RT.tour_mode]: { 
    treeRef: rtHeirarchyTree.project.tour_mode,
    typesInRootPath: [RT.project],
    defaultValues: tourModePropertyDefaults,
  },
  [RT.lead_gen_field]: { 
    treeRef: rtHeirarchyTree.project.lead_gen_field,
    typesInRootPath: [RT.project],
    defaultValues: leadGenFieldPropertyDefaults,
    defaultName: "Field",
  },
  [RT.language]: { 
    treeRef: rtHeirarchyTree.project.language,
    typesInRootPath: [RT.project],
    defaultValues: languagePropertyDefaults,
    defaultName: "Language",
  },
  [RT.variable]: { 
    treeRef: rtHeirarchyTree.project.variable,
    typesInRootPath: [RT.project],
    defaultValues: variablePropertyDefaults,
    defaultName: "Variable",
  },
  [RT.scene]: { 
    treeRef: rtHeirarchyTree.project.scene,
    typesInRootPath: [RT.project],
    defaultValues: scenePropertyDefaults,
    defaultName: "Scene",
  },
  [RT.rule]: {
    treeRef: rtHeirarchyTree.project.scene.rule,
    typesInRootPath: [RT.project, RT.scene],
    defaultValues: rulePropertyDefaults,
    defaultName: "Rule",
  },
  [RT.when_event]: {
    treeRef: rtHeirarchyTree.project.scene.rule.when_event,
    typesInRootPath: [RT.project, RT.scene, RT.rule],
    defaultValues: whenEventPropertyDefaults,
  },
  [RT.then_action]: {
    treeRef: rtHeirarchyTree.project.scene.rule.then_action,
    typesInRootPath: [RT.project, RT.scene, RT.rule],
    defaultValues: thenActionPropertyDefaults,
  },
  [RT.element]: {
    treeRef: rtHeirarchyTree.project.scene.element.element,
    typesInRootPath: [RT.project, RT.scene, RT.element],
    defaultValues: elementPropertyDefaults,
    defaultName: "Element"
  },
  [RT.item]: {
    treeRef: rtHeirarchyTree.project.scene.element.element.item,
    typesInRootPath: [RT.project, RT.scene, RT.element],
    defaultValues: itemPropertyDefaults,
    defaultName: "Item",
  },
  [RT.option]: {
    treeRef: rtHeirarchyTree.project.scene.element.element.item.option,
    typesInRootPath: [RT.project, RT.scene, RT.element, RT.item],
    defaultValues: optionPropertyDefaults,
  },
  [RT.shopping]: {
    treeRef: rtHeirarchyTree.project.shopping,
    typesInRootPath: [RT.project],
    defaultValues: shoppingPropertyDefaults,
  },
  [RT.product]: {
    treeRef: rtHeirarchyTree.project.shopping.product,
    typesInRootPath: [RT.project, RT.shopping],
    defaultValues: productPropertyDefaults,
  },
  [RT.avatar]: {
    treeRef: rtHeirarchyTree.project.avatar,
    typesInRootPath: [RT.project],
    defaultValues: avatarPropertyDefaults,
    defaultName: "Avatar"
  },
  [RT.discussion]: {
    treeRef: rtHeirarchyTree.discussion,
    typesInRootPath: [],
    defaultValues: discussionPropertyDefaults,
  },
  [RT.topic]: {
    treeRef: rtHeirarchyTree.discussion.topic,
    typesInRootPath: [RT.discussion],
    defaultValues: topicPropertyDefaults,
    defaultName: "Topic"
  },
  [RT.comment]: {
    treeRef: rtHeirarchyTree.discussion.topic.comment,
    typesInRootPath: [RT.discussion, RT.topic],
    defaultValues: commentPropertyDefaults,
    defaultName: "Comment"
  },
}

/**
 * Is the given child type somewhere under parent in the herirachy tree?
 * Not asking for immediage parent-child relation, but for any depth
 */
export function isTypeSubChildOf(parent: RT, child: RT): boolean {
  return recordTypeDefinitions[child].typesInRootPath.includes(parent);
}

/** Checking if child is an immediate child of parent in the heirarchy tree */
export function isTypeChildOf(parent: RT, child: RT): boolean {
  return Object.keys(recordTypeDefinitions[parent].treeRef).includes(child);
}

export function getTypeChildren(parent: RT): RT[] {
  return Object.keys(recordTypeDefinitions[parent].treeRef) as RT[];
}
