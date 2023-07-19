import { ActionBar } from "./types/Actionbar";
import { AR } from "./types/AR";
import { Audio } from "./types/Audio";
import { AudioSSML } from "./types/AudioSSML";
import { CaptureInput } from "./types/CaptureInput";
import { Cone } from "./types/Cone";
import { Cube } from "./types/Cube";
import { Cylinder } from "./types/Cylinder";
import { EmbedHtml } from "./types/EmbedHtml";
import { EmbedScorm } from "./types/EmbedSCORM";
import { Gif } from "./types/Gif";
import { Icon } from "./types/Icon";
import { ImageFlat } from "./types/ImageFlat";
import { Instruction } from "./types/Instructions";
import { MediaUpload } from "./types/MediaUpload";
import { Object3d } from "./types/Object3d";
import { PanoImage } from "./types/PanoImage";
import { PanoVideo } from "./types/PanoVideo";
import { Polygon } from "./types/Polygon";
import { ProductCard } from "./types/ProductCard";
import { QRMatcher } from "./types/QRMatcher";
import { QRReader } from "./types/QRReader";
import { Quiz } from "./types/Quiz";
import { Score } from "./types/Score";
import { Share } from "./types/Share";
import { ShoppingItem } from "./types/ShoppingItem";
import { Speech } from "./types/Speech";
import { Sphere } from "./types/Sphere";
import { Text } from "./types/Text";
import { Timer } from "./types/Timer";
import { Torus } from "./types/Torus";
import { VideoFlat } from "./types/VideoFlat";
import { WayFinder } from "./types/Wayfinder";
import { Popup } from "./types/Popup";
import { Light } from "./types/Light";
import { Hotspot } from "./types/Hotspots";
import { Environment } from "./types/Environment";
import { Zone } from "./types/Zone";
import { ColliderBox } from "./types/ColliderBox";
import { ColliderMesh } from "./types/ColliderMesh";
import { WorkspaceLogo } from "./types/WorkspaceLogo";
import { Screenshare } from "./types/Screenshare";
import { Character } from "./types/Character";
import { Embed3D } from "./types/Embed3D";
import { Seat } from "./types/Seat";
import { IElementDefinition } from "./ElementDefinition";

import { 
  ElementType, elementDisplayNames, ElementCategory, elementCategoryDisplayNames, elementTypeByCategory, 
  isElementType, sourcePropertyNames, elementsWithLinkedVariables, BasicElement 
} from "./ElementDefinition";
export { 
  ElementType, elementDisplayNames, ElementCategory, elementCategoryDisplayNames, elementTypeByCategory, 
  isElementType, sourcePropertyNames, elementsWithLinkedVariables, BasicElement 
};

import { lightType, BillboardingTypes, SHOPPING_ITEM_ELEMENT_ID, VolumeTypes, CharacterPoseTypes } from "./ElementTypes";
export { lightType, BillboardingTypes, SHOPPING_ITEM_ELEMENT_ID, VolumeTypes, CharacterPoseTypes };

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
