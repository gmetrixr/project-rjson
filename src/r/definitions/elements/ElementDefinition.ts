import { ElementProperty } from "../../recordTypes/Element";
import { ItemProperty } from "../../recordTypes/Item";
import { RuleAction } from "../rules";
import { RuleEvent } from "../rules";
import { ICogObjectDefinition } from "../BaseCogObject";
import { SubstituteProperty } from "../../recordTypes/Substitute";

export interface IElementDefinition extends ICogObjectDefinition {
  element_type: ElementType;
  elementDefaultName: string,
  properties: Array<ElementProperty>;
  defaultOverrides: Partial<Record<ElementProperty, unknown>>;
  itemProperties?: Array<ItemProperty>;
  itemDefaultOverrides?: Partial<Record<ItemProperty, unknown>>;
  substituteProperties?: Array<SubstituteProperty>;
  substituteDefaultOverrides?: Partial<Record<SubstituteProperty, unknown>>;
}

export enum ElementType {
  basic_element = "basic_element",
  image_flat = "image_flat",
  video_flat = "video_flat",
  audio = "audio",
  audio_ssml = "audio_ssml",
  text = "text",
  object_3d = "object_3d",
  collider_mesh = "collider_mesh",
  score = "score",
  timer = "timer",
  menu = "menu",
  gif = "gif",
  pano_image = "pano_image",
  pano_video = "pano_video",
  polygon = "polygon",
  cube = "cube",
  sphere = "sphere",
  cone = "cone",
  torus = "torus",
  cylinder = "cylinder",
  carousel = "carousel",
  wayfinder = "wayfinder",
  icon = "icon",
  speech = "speech",
  actionbar = "actionbar",
  product_card = "product_card",
  quiz = "quiz",
  group = "group",
  qrcode_browser = "qrcode_browser",
  qrcode_matcher = "qrcode_matcher",
  media_upload = "media_upload",
  web_state = "web_state",
  capture_input = "capture_input",
  share = "share",
  embed_html = "embed_html",
  ar = "ar",
  embed_scorm = "embed_scorm",
  instruction = "instruction",
  shopping_item="shopping_item", //for ecommerce integration,
  popup = "popup",
  light = "light",
  hotspot = "hotspot",
  environment = "environment",
  zone = "zone",
  collider_box = "collider_box",
  collider_volume = "collider_volume",
  workspace_logo = "workspace_logo",
  screenshare = "screenshare",
  character = "character",
  embed_3d = "embed_3d",
  seat = "seat",
  minimap = "minimap"
}

export const elementDisplayNames: Record<ElementType, string> = {
  basic_element: "Basic Element",
  pano_image: "Image 360",
  pano_video: "Video 360",
  image_flat: "Image",
  video_flat: "Video",
  text: "Text",
  gif: "GIF",
  icon: "Emoji",
  audio: "Audio",
  audio_ssml: "Text-to-Speech",
  object_3d: "3D Model",
  collider_mesh: "Collider Mesh",
  polygon: "Polygon",
  cube: "Cube",
  sphere: "Sphere",
  cone: "Cone",
  torus: "Torus",
  cylinder: "Cylinder",
  light: "Light",
  ar: "AR",
  qrcode_browser: "QR Browser",
  qrcode_matcher: "QR Matcher",
  wayfinder: "Wayfinder",
  score: "Score",
  timer: "Timer",
  quiz: "Quiz",
  speech: "Voice Recognition",
  capture_input: "Capture Input",
  media_upload: "Media Upload",
  actionbar: "Actionbar",
  popup: "Pop-up",
  product_card: "Product Card",
  instruction: "Story",
  embed_html: "Embed HTML",
  share: "Share",
  embed_scorm: "SCORM",
  shopping_item: "Shopping Item",
  menu: "Menu",
  carousel: "Pop-up",
  group: "Group",
  web_state: "Web State",
  hotspot: "Hotspot",
  environment: "Environment",
  zone: "Zone",
  collider_box: "Collider Volume",
  collider_volume: "Collider Volume",
  workspace_logo: "Workspace Logo",
  screenshare: "Screenshare",
  character: "AI Character",
  embed_3d: "Embed 3D",
  seat: "Seat",
  minimap: "Minimap",
};

export enum ElementCategory {
  panorama = "panorama",
  standard = "standard",
  audio = "audio",
  three_d = "three_d",
  spatial = "spatial",
  gamification = "gamification",
  user_input = "user_input",
  user_interface = "user_interface",
  connect = "connect",
  ecommerce = "ecommerce",
}

export const elementCategoryDisplayNames: Record<ElementCategory, string> = {
  panorama: "Panorama",
  standard: "Standard",
  audio: "Audio",
  three_d: "3D",
  spatial: "Spatial",
  gamification: "Gamification",
  user_input: "User Input",
  user_interface: "User Interface",
  connect: "Connect",
  ecommerce: "E-Commerce",
};

export const elementsWithLinkedVariables = [
  ElementType.embed_scorm,
  ElementType.media_upload
]

export const elementTypeByCategory: Record<ElementCategory, ElementType[]> = {
  panorama: [
    ElementType.pano_image,
    ElementType.pano_video,
  ],
  standard: [
    ElementType.image_flat,
    ElementType.video_flat,
    ElementType.text,
    ElementType.gif,
    ElementType.icon,
    ElementType.hotspot,
    ElementType.workspace_logo,
  ],
  audio: [
    ElementType.audio,
    ElementType.audio_ssml,
  ],
  three_d: [
    ElementType.object_3d,
    ElementType.polygon,
    ElementType.cube,
    ElementType.sphere,
    ElementType.cone,
    ElementType.torus,
    ElementType.cylinder,
    ElementType.light,
    ElementType.zone,
    ElementType.collider_volume,
    ElementType.collider_mesh,
    ElementType.screenshare,
    ElementType.character,
    ElementType.embed_3d,
    ElementType.seat,
    ElementType.minimap,
  ],
  spatial: [
    ElementType.ar,
    ElementType.qrcode_browser,
    ElementType.qrcode_matcher,
  ],
  gamification: [
    ElementType.score,
    ElementType.timer,
    ElementType.quiz,
  ],
  user_input: [
    ElementType.speech,
    ElementType.capture_input,
    ElementType.media_upload,
  ],
  user_interface: [
    ElementType.actionbar,
    ElementType.popup,
    ElementType.product_card,
    ElementType.instruction,
  ],
  connect: [
    ElementType.embed_html,
    ElementType.share,
    ElementType.embed_scorm,
  ],
  ecommerce: [
    ElementType.shopping_item,
  ],
};


/**
 * https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates
 * Useful while trying to use the ".type" property of an "untyped" json
 */
export function isElementType(type: string): type is ElementType {
  return ElementType[(type as ElementType)] !== undefined;
}

export const BasicElement: IElementDefinition = {
  element_type: ElementType.basic_element ,
  elementDefaultName: "Basic Element",
  properties: [ElementProperty.element_type],
  defaultOverrides: {},
  events: [
    RuleEvent.on_click, 
    RuleEvent.on_been_clicked,
    RuleEvent.on_hover
  ],
  actions: [
    RuleAction.show,
    RuleAction.hide,
    RuleAction.toggle_showhide,
  ]
}

/** A list of properties that contain the type en.Source or en.Source[] */
export const sourcePropertyNames = {
  /** A list of all ElementProperties that end with the word "source". Use to understand which properties contain file source objects */
  elementProperties: [ElementProperty.source, ElementProperty.background_source, ElementProperty.threed_source],
  /** A list of all ElementProperties that end with the word "sources". Use to understand which properties contain file source object arrays */
  elementArrayProperties: [ElementProperty.image_sources],
  /** A list of all ItemProperties that end with the word "source". Use to understand which properties contain file source objects */  
  itemProperties: [ItemProperty.item_source],
  /** A list of all SubstituteProperties that end with the word "source". Use to understand which properties contain file source objects */  
  substituteProperties: [SubstituteProperty.substitute_source],
}

