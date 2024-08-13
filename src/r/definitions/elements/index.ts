import { ActionBar } from "./types/Actionbar.js";
import { AR } from "./types/AR.js";
import { Audio } from "./types/Audio.js";
import { AudioSSML } from "./types/AudioSSML.js";
import { CaptureInput } from "./types/CaptureInput.js";
import { Cone } from "./types/Cone.js";
import { Cube } from "./types/Cube.js";
import { Cylinder } from "./types/Cylinder.js";
import { EmbedHtml } from "./types/EmbedHtml.js";
import { EmbedScorm } from "./types/EmbedSCORM.js";
import { Gif } from "./types/Gif.js";
import { Group } from "./types/Group.js";
import { Icon } from "./types/Icon.js";
import { ImageFlat } from "./types/ImageFlat.js";
import { Instruction } from "./types/Instructions.js";
import { MediaUpload } from "./types/MediaUpload.js";
import { Object3d } from "./types/Object3d.js";
import { PanoImage } from "./types/PanoImage.js";
import { PanoVideo } from "./types/PanoVideo.js";
import { Polygon } from "./types/Polygon.js";
import { ProductCard } from "./types/ProductCard.js";
import { QRMatcher } from "./types/QRMatcher.js";
import { QRReader } from "./types/QRReader.js";
import { Quiz } from "./types/Quiz.js";
import { Quiz2 } from "./types/Quiz2.js";
import { Score } from "./types/Score.js";
import { Share } from "./types/Share.js";
import { ShoppingItem } from "./types/ShoppingItem.js";
import { Speech } from "./types/Speech.js";
import { Sphere } from "./types/Sphere.js";
import { Text } from "./types/Text.js";
import { Timer } from "./types/Timer.js";
import { Torus } from "./types/Torus.js";
import { VideoFlat } from "./types/VideoFlat.js";
import { WayFinder } from "./types/Wayfinder.js";
import { Popup } from "./types/Popup.js";
import { Light } from "./types/Light.js";
import { Hotspot } from "./types/Hotspots.js";
import { Environment } from "./types/Environment.js";
import { Zone } from "./types/Zone.js";
import { ColliderBox } from "./types/ColliderBox.js";
import { ColliderMesh } from "./types/ColliderMesh.js";
import { WorkspaceLogo } from "./types/WorkspaceLogo.js";
import { Screenshare } from "./types/Screenshare.js";
import { Character } from "./types/Character.js";
import { Embed3D } from "./types/Embed3D.js";
import { Seat } from "./types/Seat.js";
import { Minimap } from "./types/Minimap.js";
import { IElementDefinition } from "./ElementDefinition.js";

import { 
  ElementType, elementDisplayNames, ElementCategory, elementCategoryDisplayNames, elementTypeByCategory, 
  isElementType, sourcePropertyNames, elementsWithLinkedVariables, BasicElement
} from "./ElementDefinition.js";
export { 
  ElementType, elementDisplayNames, ElementCategory, elementCategoryDisplayNames, elementTypeByCategory, 
  isElementType, sourcePropertyNames, elementsWithLinkedVariables, BasicElement 
};

import { lightType, BillboardingTypes, SHOPPING_ITEM_ELEMENT_ID, VolumeTypes, CharacterPoseTypes, MinimapAlignment, CharacterBrainType } from "./ElementTypes.js";
import { ElementProperty } from "../../recordTypes/Element.js";
export { lightType, BillboardingTypes, SHOPPING_ITEM_ELEMENT_ID, VolumeTypes, CharacterPoseTypes, MinimapAlignment, CharacterBrainType };

export const elementList: IElementDefinition[] = [
  ActionBar,
  AR,
  Audio,
  AudioSSML,
  CaptureInput,
  Cone,
  Cube,
  Cylinder,
  EmbedHtml,
  EmbedScorm,
  Gif,
  Group,
  Icon,
  Instruction,
  MediaUpload,
  Object3d,
  PanoImage,
  PanoVideo,
  Polygon,
  ProductCard,
  QRMatcher,
  QRReader,
  Quiz,
  Quiz2,
  Score,
  Share,
  ShoppingItem,
  Speech,
  Sphere,
  Text,
  Timer,
  Torus,
  VideoFlat,
  WayFinder,
  ImageFlat,
  Popup,
  Light,
  Hotspot,
  Environment,
  Zone,
  ColliderBox,
  ColliderMesh,
  WorkspaceLogo,
  Screenshare,
  Character,
  Embed3D,
  Seat,
  Minimap
];

/**
 * A map for known elementTypes
 * Gets initialized using elementList from "ElementList.ts"
 * {
 *   element_name1: ElementDefinition1
 *   element_name2: ElementDefinition2
 * }
 */
export const eTypeToDefn: Partial<Record<ElementType, IElementDefinition>> = {};
const init = () => {
  for(const e of elementList) {
    eTypeToDefn[e.element_type] = e;
  }
};
init();

//Properties that can contian a variable name, and should through variable templating
export const elementPropertiesContainingText: Array<ElementProperty> = [
  ElementProperty.text,
  ElementProperty.embed_string,
  ElementProperty.character_thinking_dialogue,
  ElementProperty.character_chatbot_welcome_dialogue,
];
