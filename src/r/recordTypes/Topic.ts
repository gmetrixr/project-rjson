export enum TopicProperty {
  topic_position = "topic_position",
  topic_resolved = "topic_resolved",
  topic_scene_id = "topic_scene_id",
}

export const topicPropertyDefaults: Record<TopicProperty, unknown> = {
  [TopicProperty.topic_position]: [0, 0, 0], // [x, y, z] world coordinates
  [TopicProperty.topic_resolved]: false,
  [TopicProperty.topic_scene_id]: -1
}
