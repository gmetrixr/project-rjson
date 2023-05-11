export enum RuleEvent {
  on_preload = "on_preload",
  on_load = "on_load",
  /** Used to communicate from the element / scene / experience if it is ready to start or not */
  on_ready = "on_ready",
  on_click = "on_click",
  on_been_clicked = "on_been_clicked",
  on_press = "on_press",
  on_release = "on_release",
  on_select = "on_select", //On selecting menu items
  on_end = "on_end",
  on_timermatch = "on_timermatch", //additional property number
  on_swipeup = "on_swipeup",
  on_swipedown = "on_swipedown",
  on_swipeleft = "on_swipeleft",
  on_swiperight = "on_swiperight",
  /**
   * The reason on_phrase_match is used instead of on_match, is because the text displaed in whenEvent is different in both cases
   * on_match: "Matches data"
   * on_phrase_match: "matches phrase"
   */
  on_phrase_match = "on_phrase_match", // speech
  on_phrase_nomatch = "on_phrase_nomatch", // speech
  on_click_item = "on_click_item", // on click action bar element
  //variables
  on_var_change = "on_var_change",
  on_set_eq = "on_set_eq", //additional property value
  on_set_not_eq = "on_set_not_eq", //additional property value

  //variable_boolean
  on_set_true = "on_set_true",
  on_set_false = "on_set_false",
  //variable_number
  on_set_gt = "on_set_gt", //additional property number
  on_set_gte = "on_set_gte", //additional property number
  on_set_lt = "on_set_lt", //additional property number
  on_set_lte = "on_set_lte", //additional property number

  //variable string
  on_set_between = "on_set_between", //additional property number lower and greater respectively

  // capture text, speech match
  on_capture_input = "on_capture_input", //additional property string value
  on_hover = "on_hover",
  on_match = "on_match",
  on_nomatch = "on_nomatch",

  //is in list
  on_is_in_list = "on_is_in_list",
  on_is_not_in_list = "on_is_not_in_list",

  // for ProductCard
  on_product_card_cta1_click = "on_product_card_cta1_click",
  
  // for EmbedScorm
  on_scorm_set_score = "on_scorm_set_score",
  on_scorm_initialize = "on_scorm_initialize",
  on_scorm_finish = "on_scorm_finish",

  // for MediaUpload
  on_successful_upload = "on_successful_upload",

  //embed-html and popup
  on_close = "on_close",

  // video duration match
  on_duration_match = "on_duration_match",

  // viewer element
  // When Viewer enters zone <zone1>
  // When Viewer leaves zone <zone1>
  on_enter = "on_enter",
  on_leave = "on_leave",
}

export enum WhenEventProperty {
  index = "index",
  timer_value = "timer_value",
  phrase = "phrase",
  id = "id",
  value = "value",
  number_value = "number_value",
  number_value_lower = "number_value_lower",
  number_value_greater = "number_value_greater",
  duration = "duration",
  match_strings = "match_strings",
  list_value = "list_value",
  score = "score",
  duration_value = "duration_value"
}

export const rEventProperties: Record<RuleEvent, Array<WhenEventProperty | unknown>> = {
  on_ready: [],
  on_preload: [],
  on_load: [], // for scene load, to autostart things on scene load
  on_click: [],
  on_been_clicked: [],
  on_press: [],
  on_release: [],
  on_select: [WhenEventProperty.index],
  on_swipeup: [],
  on_swipedown: [],
  on_swipeleft: [],
  on_swiperight: [],
  on_end: [],
  on_timermatch: [WhenEventProperty.timer_value], //additional property number
  on_phrase_match: [WhenEventProperty.phrase], // speech
  on_phrase_nomatch: [], // speech
  on_click_item: [WhenEventProperty.id], // on_click on any element item
  on_var_change: [],
  on_set_eq: [WhenEventProperty.value],
  on_set_not_eq: [WhenEventProperty.value],
  on_set_true: [],
  on_set_false: [],
  on_set_gt: [WhenEventProperty.number_value], //additional property number
  on_set_gte: [WhenEventProperty.number_value], //additional property number
  on_set_lt: [WhenEventProperty.number_value], //additional property number
  on_set_lte: [WhenEventProperty.number_value], //additional property number
  on_set_between: [WhenEventProperty.number_value_lower, WhenEventProperty.number_value_greater], //additional property number
  on_capture_input: [],
  on_hover: [WhenEventProperty.duration],

  on_match: [WhenEventProperty.match_strings],
  on_nomatch: [],
  // for MediaUpload
  on_successful_upload: [],
  // ProductCard
  on_product_card_cta1_click: [],
  //is in list
  on_is_in_list: [WhenEventProperty.list_value],
  on_is_not_in_list: [WhenEventProperty.list_value],
  // for EmbedScorm
  on_scorm_set_score: [WhenEventProperty.score],
  on_scorm_initialize: [],
  on_scorm_finish: [],
  //for popup and embedhtml
  on_close: [],

  // video duration match
  on_duration_match: [WhenEventProperty.duration_value],

  // viewer
  on_enter: [],
  on_leave: []
};

export const rEventPropertyDefaults: Record<WhenEventProperty, Array<unknown> | string | number | null> =  {
  index: 0,
  timer_value: 0,
  phrase: "",
  id: 0,
  value: 0,
  number_value: 0,
  number_value_lower: 0,
  number_value_greater: 0,
  duration: 0,
  match_strings: null,
  list_value: [],
  score: 0,
  duration_value: 0
}

export const rEventDisplayName: Record<RuleEvent, string> = {
  [RuleEvent.on_preload]: "preloads",
  [RuleEvent.on_load]: "loads",
  [RuleEvent.on_ready]: "", //Not used in UI
  [RuleEvent.on_click]: "is clicked",
  [RuleEvent.on_been_clicked]: "has been clicked",
  [RuleEvent.on_press]: "is pressed (controller only)",
  [RuleEvent.on_release]: "is released (controller only)",
  [RuleEvent.on_select]: "item is selected",
  [RuleEvent.on_swipeup]: "is swiped up",
  [RuleEvent.on_swipedown]: "is swiped down",
  [RuleEvent.on_swipeleft]: "is swiped left",
  [RuleEvent.on_swiperight]: "is swiped right",
  [RuleEvent.on_end]: "ends",
  [RuleEvent.on_timermatch]: "matches value", //additional property number
  [RuleEvent.on_phrase_match]: "matches phrase",
  [RuleEvent.on_phrase_nomatch]: "matches no phrase", // speech
  [RuleEvent.on_click_item]: "gets clicked", // on_click_abe

  //variables
  [RuleEvent.on_var_change]: "changes",
  [RuleEvent.on_set_eq]: "is =",
  [RuleEvent.on_set_not_eq]: "is not =",
  [RuleEvent.on_is_in_list]: "is in list",
  [RuleEvent.on_is_not_in_list]: "is not in list",
  //variable_boolean
  [RuleEvent.on_set_true]: "is TRUE",
  [RuleEvent.on_set_false]: "is FALSE",
  //variable_number
  [RuleEvent.on_set_gt]: "is >", //additional property number
  [RuleEvent.on_set_gte]: "is > OR =", //additional property number
  [RuleEvent.on_set_lt]: "is <", //additional property number
  [RuleEvent.on_set_lte]: "is < OR =", //additional property number
  [RuleEvent.on_set_between]: "is between",
  [RuleEvent.on_capture_input]: "collects data", //additional property string
  [RuleEvent.on_hover]: "is hovered",
  [RuleEvent.on_match]: "matches",
  [RuleEvent.on_nomatch]: "matches no data",
  // for MediaUpload
  [RuleEvent.on_successful_upload]: "collects media",
  [RuleEvent.on_product_card_cta1_click]: "button is clicked",
  //for EmbedScorm
  [RuleEvent.on_scorm_set_score]: "sets score",
  [RuleEvent.on_scorm_initialize]: "is initialized",
  [RuleEvent.on_scorm_finish]: "is completed",
  //for popup and embedhtml
  [RuleEvent.on_close]: "is closed",
  [RuleEvent.on_duration_match]: "matches duration",

  // viewer
  [RuleEvent.on_enter]: "enters",
  [RuleEvent.on_leave]: "leaves"
};
