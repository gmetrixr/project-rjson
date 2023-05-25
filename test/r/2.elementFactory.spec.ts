import { expect } from "chai";
import { ElementFactory } from "../../src/r/recordFactories/ElementFactory";
import { ElementType } from "../../src/r/definitions/elements";
import { RT, rtp } from "../../src/r/R";
import { elementPropertyDefaults } from "../../src/r/recordTypes/Element";
import { pathUtils } from "@gmetrixr/gdash";
import { fn } from "../../src/r/definitions";

const element1 = {
	"type": "element",
	"props": {
		"element_type": "group",
		"billboarding": null,
		"mouse_jump": true
	},
	"name": "S540",
	"records": {
		"element": {
			"1593670865003": {
				"type": "element",
				"props": {
					"wh": [
						2,
						2
					],
					"scale": 0.26,
					"hidden": false,
					"locked": true,
					"source": {
						"id": 24854,
						"name": "lenovo_Plus.png",
						"file_paths": {
							"o": "o/lenovo_Plus.png",
							"t": "t/lenovo_Plus.jpg"
						},
						"file_urls": {
							"o": "https://u.vrgmetri.com/gb-sms-prod-1/media/2021-1/fywmlh/5abea301-d1b7-4c1c-ab72-1022f255b5fd/o/lenovo_Plus.png",
							"t": "https://u.vrgmetri.com/gb-sms-prod-1/media/2021-1/fywmlh/5abea301-d1b7-4c1c-ab72-1022f255b5fd/t/lenovo_Plus.jpg",
							"r": "https://u.vrgmetri.com/image/{{TRANSFORM_PARAMS}}/gb-sms-prod-1/media/2021-1/fywmlh/5abea301-d1b7-4c1c-ab72-1022f255b5fd/o/lenovo_Plus.png"
						},
						"size": "1427",
						"type": "IMAGE"
					},
					"opacity": 1,
					"animation": {
						"name": "fade",
						"speed": 3
					},
					"placer_3d": [
						7.634543539193954,
						-0.27337771857309395,
						-2.088550455308503,
						-1.9089644545682527,
						-74.40980685270543,
						0.0914606514979893,
						1,
						1,
						1
					],
					"element_type": "image_flat",
					"hover_animation": true,
					"billboarding": null,
					"mouse_jump": true
				},
				"name": "S540 selection tag",
				"order": 0
			},
			"1593673427890": {
				"type": "element",
				"props": {
					"color": "#FFC1A3",
					"scale": 0.30000000000000016,
					"sides": 23,
					"hidden": true,
					"locked": true,
					"opacity": 0,
					"animation": {
						"name": "",
						"speed": 1
					},
					"placer_3d": [
						7.487920006873475,
						-0.28643772868506384,
						-2.048247079707215,
						-0.9503695881723265,
						-73.8223747255122,
						-1.6491456781603136e-13,
						1,
						1,
						1
					],
					"wireframe": false,
					"pivot_point": "center",
					"element_type": "polygon",
					"mask": true,
					"hover_animation": true,
					"billboarding": null,
					"mouse_jump": true
				},
				"name": "S540 close mask",
				"order": 1
			},
			"1593672908479": {
				"type": "element",
				"props": {
					"wh": [
						2,
						2
					],
					"scale": 0.26,
					"hidden": true,
					"locked": true,
					"source": {
						"id": 24854,
						"name": "lenovo_Plus.png",
						"file_paths": {
							"o": "o/lenovo_Plus.png",
							"t": "t/lenovo_Plus.jpg"
						},
						"file_urls": {
							"o": "https://u.vrgmetri.com/gb-sms-prod-1/media/2021-1/fywmlh/5abea301-d1b7-4c1c-ab72-1022f255b5fd/o/lenovo_Plus.png",
							"t": "https://u.vrgmetri.com/gb-sms-prod-1/media/2021-1/fywmlh/5abea301-d1b7-4c1c-ab72-1022f255b5fd/t/lenovo_Plus.jpg",
							"r": "https://u.vrgmetri.com/image/{{TRANSFORM_PARAMS}}/gb-sms-prod-1/media/2021-1/fywmlh/5abea301-d1b7-4c1c-ab72-1022f255b5fd/o/lenovo_Plus.png"
						},
						"size": "1427",
						"type": "IMAGE"
					},
					"opacity": 1,
					"animation": {
						"name": "fade",
						"speed": 3
					},
					"placer_3d": [
						7.163200930110955,
						-0.2675451812038026,
						-1.9558105083145725,
						-1.9089644545681295,
						-76.64906064727919,
						-44.641654978420945,
						1,
						1,
						1
					],
					"element_type": "image_flat",
					"hover_animation": true,
					"billboarding": null,
					"mouse_jump": true
				},
				"name": "S540 close tag ",
				"order": 2
			},
			"1593671596141": {
				"type": "element",
				"props": {
					"wh": [
						3.2,
						2
					],
					"scale": 2.1,
					"hidden": true,
					"locked": true,
					"source": {
						"id": 24872,
						"name": "lenovo_S540.png",
						"file_paths": {
							"o": "o/lenovo_S540.png",
							"t": "t/lenovo_S540.jpg"
						},
						"file_urls": {
							"o": "https://u.vrgmetri.com/gb-sms-prod-1/media/2021-1/fywmlh/3f53ddca-14a5-4a2c-b888-de8e636964c5/o/lenovo_S540.png",
							"t": "https://u.vrgmetri.com/gb-sms-prod-1/media/2021-1/fywmlh/3f53ddca-14a5-4a2c-b888-de8e636964c5/t/lenovo_S540.jpg",
							"r": "https://u.vrgmetri.com/image/{{TRANSFORM_PARAMS}}/gb-sms-prod-1/media/2021-1/fywmlh/3f53ddca-14a5-4a2c-b888-de8e636964c5/o/lenovo_S540.png"
						},
						"size": "51312",
						"type": "IMAGE"
					},
					"opacity": 1,
					"animation": {
						"name": null,
						"speed": 1
					},
					"placer_3d": [
						7.430857662399236,
						-2.974848461746484,
						0.1451365817049044,
						-0.017747149045674204,
						-91.28709736966279,
						0.16333809889931952,
						1,
						1,
						1
					],
					"element_type": "image_flat",
					"hover_animation": true,
					"billboarding": null,
					"mouse_jump": true
				},
				"name": "S540 variant menu",
				"order": 3
			},
			"1593671614223": {
				"type": "element",
				"props": {
					"wh": [
						0.9500000000000001,
						1.9
					],
					"scale": 1.5999999999999999,
					"hidden": true,
					"locked": true,
					"source": {
						"id": 24848,
						"name": "lenovo_Big_Button.png",
						"file_paths": {
							"o": "o/lenovo_Big_Button.png",
							"t": "t/lenovo_Big_Button.jpg"
						},
						"file_urls": {
							"o": "https://u.vrgmetri.com/gb-sms-prod-1/media/2021-1/fywmlh/f8d46f7d-2678-47f9-bd9c-c5b7c057744b/o/lenovo_Big_Button.png",
							"t": "https://u.vrgmetri.com/gb-sms-prod-1/media/2021-1/fywmlh/f8d46f7d-2678-47f9-bd9c-c5b7c057744b/t/lenovo_Big_Button.jpg",
							"r": "https://u.vrgmetri.com/image/{{TRANSFORM_PARAMS}}/gb-sms-prod-1/media/2021-1/fywmlh/f8d46f7d-2678-47f9-bd9c-c5b7c057744b/o/lenovo_Big_Button.png"
						},
						"size": "2436",
						"type": "IMAGE"
					},
					"opacity": 1,
					"animation": {
						"name": "",
						"speed": 1
					},
					"placer_3d": [
						6.472721688562976,
						-2.725013306041675,
						0.7530350412961633,
						0.9125959096270346,
						-89.84720162147553,
						-0.15444574137018732,
						0.97,
						0.93,
						1
					],
					"element_type": "image_flat",
					"hover_animation": true,
					"billboarding": null,
					"mouse_jump": true
				},
				"name": "S540 variant 1 tag",
				"order": 4
			},
			"1593672094769": {
				"type": "element",
				"props": {
					"color": "#FFC1A3",
					"scale": 0.84,
					"sides": 4,
					"hidden": true,
					"locked": true,
					"opacity": 0,
					"animation": {
						"name": "",
						"speed": 1
					},
					"placer_3d": [
						5.5008831290162945,
						-2.292119368624457,
						0.6719386522302367,
						-2.5576492077604622,
						-87.25778587282983,
						-0.3053910968009097,
						0.9,
						1.9000000000000008,
						1
					],
					"wireframe": false,
					"pivot_point": "center",
					"element_type": "polygon",
					"mask": true,
					"hover_animation": true,
					"billboarding": null,
					"mouse_jump": true
				},
				"name": "S540 v1 polygon",
				"order": 5
			},
			"1593756782395": {
				"type": "element",
				"props": {
					"hidden": true,
					"group_eid": 1593710435544,
					"element_type": "product_card",
					"background_source": {
						"uri": ""
					},
					"heading": "IdeaPad S540",
					"short_description": "Style and ability in one",
					"price": "₹67,990",
					"price_color": "rgba(72, 72, 72, 0.8)",
					"description": "Offering up to the latest 10th Gen Intel® Core™ processors with long battery life that won’t disappoint, up to 12 hours & fast charging. It has an ultraslim aluminum chassis at 16.9mm and 14” FHD display with 72 percent NTSC color gamut providing rich picture quality.\nQuiet, dual-action fans & cooling design keep system from overheating.",
					"image_sources": [
						{
							"id": 25050,
							"name": "IdeaPadS540.jpg",
							"file_paths": {
								"o": "o/IdeaPadS540.jpg",
								"t": "t/IdeaPadS540.jpg"
							},
							"file_urls": {
								"o": "https://u.vrgmetri.com/gb-sms-prod-1/media/2021-1/fywmlh/734f9a0e-ff1a-4874-96a7-dc53d28cca21/o/IdeaPadS540.jpg",
								"t": "https://u.vrgmetri.com/gb-sms-prod-1/media/2021-1/fywmlh/734f9a0e-ff1a-4874-96a7-dc53d28cca21/t/IdeaPadS540.jpg",
								"r": "https://u.vrgmetri.com/image/{{TRANSFORM_PARAMS}}/gb-sms-prod-1/media/2021-1/fywmlh/734f9a0e-ff1a-4874-96a7-dc53d28cca21/o/IdeaPadS540.jpg"
							},
							"size": "229700",
							"type": "IMAGE"
						}
					],
					"threed_source": {
						"uri": ""
					},
					"add_to_cart_button_text": "Add to cart",
					"add_to_cart_button_link": "#",
					"billboarding": null,
					"mouse_jump": true
				},
				"name": "S540 v1 PC ",
				"records": {
					"item": {
						"1593754481719": {
							"type": "item",
							"props": {
								"item_description": "CPU: i5-1021U\nDISPLAY: 15.6\" FHD IPS AG 250 nits\nRAM/HDD: 8GB / 1TB + 256GB SSD\nGRAPHICS: NVIDIA MX 250 2GB GDDR5",
								"item_heading": "Specific Characteristics"
							},
							"name": "Specific Characteristics",
							"order": 0
						}
					}
				},
				"order": 6
			}
		}
	},
	"order": 2
};

const element2 = {
	"type": "element",
	"props": {
		"wh": [
			3.6,
			2
		],
		"scale": 1.5000000000000004,
		"hidden": false,
		"locked": true,
		"source": {
			"id": 24775,
			"name": "lenovo_exit-03-07-07.png",
			"file_paths": {
				"o": "o/lenovo_exit-03-07-07.png",
				"t": "t/lenovo_exit-03-07-07.jpg"
			},
			"file_urls": {
				"o": "https://u.vrgmetri.com/gb-sms-prod-1/media/2021-1/fywmlh/f3bfa205-8a66-4864-a08f-4bd84e6fc7ca/o/lenovo_exit-03-07-07.png",
				"t": "https://u.vrgmetri.com/gb-sms-prod-1/media/2021-1/fywmlh/f3bfa205-8a66-4864-a08f-4bd84e6fc7ca/t/lenovo_exit-03-07-07.jpg",
				"r": "https://u.vrgmetri.com/image/{{TRANSFORM_PARAMS}}/gb-sms-prod-1/media/2021-1/fywmlh/f3bfa205-8a66-4864-a08f-4bd84e6fc7ca/o/lenovo_exit-03-07-07.png"
			},
			"size": "23133",
			"type": "IMAGE"
		},
		"opacity": 1,
		"animation": {
			"name": "",
			"speed": 1
		},
		"placer_3d": [
			-8.042042896853294,
			-2.3134037808641095,
			0.22445100372944293,
			-0.03589162618134107,
			89.28222039171337,
			-0.000897712594830067,
			1,
			1,
			1
		],
		"element_type": "image_flat",
		"hover_animation": true,
		"billboarding": null,
		"mouse_jump": true
	},
	"name": "lenovo exit tag",
	"order": 16
};

const element3 = {
	"type": "element",
	"props": {
		"hidden": true,
		"group_eid": 1593710435544,
		"element_type": "product_card",
		"background_source": {
			"uri": ""
		},
		"heading": "IdeaPad S540",
		"short_description": "Style and ability in one",
		"price": "₹67,990",
		"price_color": "rgba(72, 72, 72, 0.8)",
		"description": "Offering up to the latest 10th Gen Intel® Core™ processors with long battery life that won’t disappoint, up to 12 hours & fast charging. It has an ultraslim aluminum chassis at 16.9mm and 14” FHD display with 72 percent NTSC color gamut providing rich picture quality.\nQuiet, dual-action fans & cooling design keep system from overheating.",
		"image_sources": [
			{
				"id": 25050,
				"name": "IdeaPadS540.jpg",
				"file_paths": {
					"o": "o/IdeaPadS540.jpg",
					"t": "t/IdeaPadS540.jpg"
				},
				"file_urls": {
					"o": "https://u.vrgmetri.com/gb-sms-prod-1/media/2021-1/fywmlh/734f9a0e-ff1a-4874-96a7-dc53d28cca21/o/IdeaPadS540.jpg",
					"t": "https://u.vrgmetri.com/gb-sms-prod-1/media/2021-1/fywmlh/734f9a0e-ff1a-4874-96a7-dc53d28cca21/t/IdeaPadS540.jpg",
					"r": "https://u.vrgmetri.com/image/{{TRANSFORM_PARAMS}}/gb-sms-prod-1/media/2021-1/fywmlh/734f9a0e-ff1a-4874-96a7-dc53d28cca21/o/IdeaPadS540.jpg"
				},
				"size": "229700",
				"type": "IMAGE"
			}
		],
		"threed_source": {
			"uri": ""
		},
		"add_to_cart_button_text": "Add to cart",
		"add_to_cart_button_link": "#",
		"billboarding": null,
		"mouse_jump": true
	},
	"name": "S540 v1 PC ",
	"records": {
		"item": {
			"1593754481719": {
				"type": "item",
				"props": {
					"item_description": "CPU: i5-1021U\nDISPLAY: 15.6\" FHD IPS AG 250 nits\nRAM/HDD: 8GB / 1TB + 256GB SSD\nGRAPHICS: NVIDIA MX 250 2GB GDDR5",
					"item_heading": "Specific Characteristics"
				},
				"name": "Specific Characteristics",
				"order": 0
			}
		}
	},
	"order": 6
};

const sourceMap = {
	24775: {
		id: 24775,
		name: "test",
		file_paths: {},
		file_urls: {
			o: "https://u.vrgmetri.com/gb-sms-dev/media/2022-12/gmetri/330018d4-9c9a-401f-81ca-537677aa1ccc/o/btn_play_2.png",
			t: "https://u.vrgmetri.com/gb-sms-dev/media/2022-12/gmetri/330018d4-9c9a-401f-81ca-537677aa1ccc/t/btn_play_2.png"
		},
		type: pathUtils.FileType.IMAGE
	}
}

describe("r ElementFactory tests", () => {
	// it("should get element type for an element", () => {
	// 	expect(new ElementFactory(element1).getElementType()).to.be.equal(ElementType.group);
	// });

	// it("should set property for an element", () => {
	// 	const elementF = new ElementFactory(element1);
	// 	elementF.set(rtp.element.mouse_jump, false);
	// 	const mouseJump = elementF.get(rtp.element.mouse_jump);
	// 	expect(mouseJump).to.be.equal(false);
	// });

	// it("should get a default value for an element property", () => {
	// 	expect(new ElementFactory(element1).getDefault(rtp.element.element_type)).to.be.equal(elementPropertyDefaults.element_type);
	// });

	// it("should get json props and default props for an element", () => {
	// 	const elementF = new ElementFactory(element2);
	// 	const props = elementF.getJsonPropsAndDefaultProps();
	// 	expect(props).to.include("use_proximity_optimization");
	// 	expect(props).to.include("linked_element_id");
	// });

	// it("should get file ids from element", () => {
	// 	const elementF = new ElementFactory(element3);
	// 	const fileIds = elementF.getFileIdsFromElement();
	// 	expect(fileIds.length).to.be.equal(1);
	// });

	// it("should inject source into element", () => {
	// 	const elementF = new ElementFactory(element2);
	// 	elementF.injectSourceIntoElement(sourceMap);
	// 	const source = elementF.get(rtp.element.source) as fn.Source;
	// 	expect(source.name).to.be.equal("test");
	// });

	// it("should add element of type to an element", () => {
	// 	const elementF = new ElementFactory(element1);
	// 	const colliderMeshElement = elementF.addElementOfType(ElementType.collider_mesh);
	// 	const recordMap = elementF.getRecordMap(RT.element);
	// 	let found = false;
	// 	for (const key in recordMap) {
	// 		if (recordMap[key].order === colliderMeshElement.order && recordMap[key].props.element_type === ElementType.collider_mesh) {
	// 			found = true;
	// 		}
	// 	}
	// 	expect(found).to.be.true;
	// });
});