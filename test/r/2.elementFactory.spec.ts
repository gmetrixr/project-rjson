import { ElementFactory } from "../../src/r/recordFactories/ElementFactory.js";
import { ElementType } from "../../src/r/definitions/elements/index.js";
import { RT, rtp } from "../../src/r/R/index.js";
import { elementPropertyDefaults } from "../../src/r/recordTypes/Element.js";
import { fn } from "../../src/r/definitions/index.js";
import { element1, element2, element3, sourceMap} from "./jsons/2.elementsObjects.js";
import { describe, it, expect } from "vitest";

describe("r ElementFactory tests", () => {
	it("should get element type for an element", () => {
		expect(new ElementFactory(element1).getElementType()).toBe(ElementType.group);
	});

	it("should set property for an element", () => {
		const elementF = new ElementFactory(element1);
		elementF.set(rtp.element.mouse_jump, false);
		const mouseJump = elementF.get(rtp.element.mouse_jump);
		expect(mouseJump).toBe(false);
	});

	it("should get a default value for an element property", () => {
		expect(new ElementFactory(element1).getDefault(rtp.element.element_type)).toBe(elementPropertyDefaults.element_type);
	});

	it("should get json props and default props for an element", () => {
		const elementF = new ElementFactory(element2);
		const props = elementF.getJsonPropsAndDefaultProps();
		expect(props).toContain("use_proximity_optimization");
		expect(props).toContain("linked_element_id");
	});

	it("should get file ids from element", () => {
		const elementF = new ElementFactory(element3);
		const fileIds = elementF.getFileIdsFromElement();
		expect(fileIds.length).toBe(1);
	});

	it("should inject source into element", () => {
		const elementF = new ElementFactory(element2);
		elementF.injectSourceIntoElement(sourceMap);
		const source = elementF.get(rtp.element.source) as fn.Source;
		expect(source.name).toBe("test");
	});

	it("should add element of type to an element", () => {
		const elementF = new ElementFactory(element1);
		const colliderMeshElement = elementF.addElementOfType(ElementType.collider_mesh);
		const recordMap = elementF.getRecordMap(RT.element);
		let found = false;
		for (const key in recordMap) {
			if (recordMap[key].order === colliderMeshElement.order && recordMap[key].props.element_type === ElementType.collider_mesh) {
				found = true;
			}
		}
		expect(found).toBe(true);
	});
});
