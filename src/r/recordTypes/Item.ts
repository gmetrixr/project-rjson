/**
 * Make sure that names are unique and that there is no overlap with ElementProperty
 */
export enum ItemProperty {
  item_heading = "item_heading",
  item_text = "item_text",
  item_hidden = "item_hidden",
  item_source = "item_source",
  item_source_type = "item_source_type",
  item_description = "item_description",
  item_embed_string = "item_embed_string",
  item_start = "item_start",
  item_end = "item_end",
  item_url = "item_url",
  item_instruction = "item_instruction",
  platforms = "platforms",
  phrase = "phrase",
  aliases = "aliases",
  phrase_id = "phrase_id",
  question_type = "question_type",
  sprite_frames = "sprite_frames",
}

export const itemPropertyDefaults: Record<ItemProperty, unknown> = {
  [ItemProperty.item_heading]: "",
  [ItemProperty.item_text]: "",
  [ItemProperty.item_hidden]: false,
  [ItemProperty.item_source]: { uri: "", id: null },
  [ItemProperty.item_source_type]: "source_type",
  [ItemProperty.item_description]: "",
  [ItemProperty.item_embed_string]: "",
  [ItemProperty.item_start]: "",
  [ItemProperty.item_end]: "",
  [ItemProperty.item_url]: "",
  [ItemProperty.item_instruction]: "instruction",
  [ItemProperty.platforms]: "platforms",
  [ItemProperty.phrase]:  "phrase",
  [ItemProperty.aliases]:  [],
  [ItemProperty.phrase_id]:  "phrase_id",
  [ItemProperty.question_type]:  "single",
  [ItemProperty.sprite_frames]: 0,
}
