export enum CommentProperty {
  comment_ts = "comment_ts",
  comment_fullname = "comment_fullname",
  comment_message = "comment_message",
}

export const commentPropertyDefaults: Record<CommentProperty, unknown> = {
  [CommentProperty.comment_ts]: Date.now(),
  [CommentProperty.comment_fullname]: "",
  [CommentProperty.comment_message]: "",
}
