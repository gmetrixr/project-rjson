import { pathUtils } from "@gmetrixr/gdash";

/**
 * Categories of Files handled by GMetri
 */
export enum FileType {
  IMAGE = "IMAGE",
  GIF = "GIF",
  VIDEO = "VIDEO",
  AUDIO = "AUDIO",
  THREED = "THREED",
  COMPRESSED = "COMPRESSED",
  OTHER = "OTHER",
}

/**
 * Minimum fields required in FileWithUrl to make it usable for the right bar and the viewer
 */
 export interface Source {
  id: number,
  name?: string,
  file_paths?: Record<string, string>,
  file_urls?: Record<string, string>,
  size?: number,
  type?: pathUtils.FileType,
  metadata?: unknown,
}
