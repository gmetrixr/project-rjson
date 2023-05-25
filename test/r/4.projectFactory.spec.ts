import { expect } from "chai";
import { RT, RecordFactory, RecordNode, createRecord } from "../../src/r/R";
import { ElementType } from "../../src/r/definitions/elements";
import { ProjectFactory } from "../../src/r/recordFactories/ProjectFactory";
import threeScenesJson from "./jsons/r3fJsons/project/threeScenesJson.json";
import manishJson from "./jsons/r3fJsons/project/manish.json";
import { PredefinedVariableName, VariableType } from "../../src/r/definitions/variables";
import { jsUtils } from "@gmetrixr/gdash";

const { generateIdV2 } = jsUtils;

describe ("r ProjectFactory tests", () => {
  it ("should add element record to a project", () => {
    const projectF = new ProjectFactory(threeScenesJson);
    const idAndRecord = projectF.addElementRecord({ parentIdOrAddress: 1684926140314, elementType: ElementType.character });
    expect(idAndRecord).to.not.be.undefined;
    const record = projectF.getDeepRecord(idAndRecord?.id as number);
    expect(record).to.not.be.undefined;
    expect(record?.props.element_type).to.be.equal(ElementType.character);
  });

  it ("should add record to a project", () => {
    const projectF = new ProjectFactory(threeScenesJson);
    const idAndRecord = projectF.addRecord({ record: createRecord(RT.element), parentIdOrAddress: 1684926516892 });
    expect(idAndRecord).to.not.be.undefined;
    expect(projectF.getDeepRecord(idAndRecord?.id as number)).to.not.be.undefined;
  });

  it ("should delete scene record from a project", () => {
    const projectF = new ProjectFactory(threeScenesJson);
    projectF.deleteRecord(1684926787722);
    const scene = projectF.getRecord(1684926787722, RT.scene);
    expect(scene).to.be.undefined;
    const tourModeRecord = projectF.getRecord(1684926798631, RT.tour_mode);
    expect(tourModeRecord).to.be.undefined;
    const menuRecord = projectF.getRecord(1684926538664, RT.menu);
    expect(menuRecord).to.be.undefined;
  });

  it ("should delete lead gen record from a project", () => {
    const projectF = new ProjectFactory(threeScenesJson);
    projectF.deleteRecord(1684926704101);
    expect(projectF.getRecord(1684926704101, RT.lead_gen_field)).to.be.undefined;
    expect(projectF.getRecord(1684926300809, RT.variable)).to.be.undefined;
  });

  it ("should delete element from project", () => {
    const projectF = new ProjectFactory(threeScenesJson);
    const deletedRecord = projectF.deleteDeepRecord(1684926504379);
    console.log(deletedRecord);
    expect(projectF.getDeepRecord(1684926504379)).to.be.undefined;
  });

  it ("should change record name for a scene in a project", () => {
    const projectF = new ProjectFactory(threeScenesJson);
    const updatedName = "Updated Name for test";
    projectF.changeRecordName(1684926516892, updatedName);
    expect(projectF.getRecord(1684926516892, RT.scene)?.name).to.be.equal(updatedName);
  });

  it ("should change record name for a lead gen field in a project", () => {
    const projectF = new ProjectFactory(threeScenesJson);
    const updatedName = "Updated Name for lead gen test";
    projectF.changeRecordName(1684926727974, updatedName);
    expect(projectF.getRecord(1684926727974, RT.lead_gen_field)?.name).to.be.equal(updatedName);
    expect(projectF.getRecord(1684926513957, RT.variable)?.name).to.be.equal(`${updatedName}_var`);
  });

  it ("should change record name for a variable in a project", () => {
    const projectF = new ProjectFactory(threeScenesJson);
    const updatedName = "variable_name_update_test";
    projectF.changeRecordName(1684929605824, updatedName);
    expect(projectF.getRecord(1684929605824, RT.variable)?.name).to.be.equal(updatedName);
  });

  it ("should change record name for an element in a project", () => {
    const projectF = new ProjectFactory(threeScenesJson);
    const updatedName = "Updated Name for element test";
    projectF.changeRecordName(1684926046527, updatedName);
    expect(projectF.getDeepRecord(1684926046527)?.name).to.be.equal(updatedName);
  });

  it ("should update records linked to variable template for a project", () => {
    const projectF = new ProjectFactory(threeScenesJson);
    const variableIdAndRecord = projectF.getIdAndRecord(1684929605824);
    expect(variableIdAndRecord).to.not.be.undefined;
    expect(variableIdAndRecord?.record.name).to.be.equal("variable_name_update_test");
    if (!variableIdAndRecord) return;
    projectF.updateRecordsLinkedToVariableTemplate(variableIdAndRecord, "string_var");
    const record = projectF.getDeepRecord(1684929354770);
    expect(record?.props.text).to.be.equal("{{variable_name_update_test}}");
  });

  it ("should update string template in record for a project", () => {
    const projectF = new ProjectFactory(threeScenesJson);
    const record = projectF.getDeepRecord(1684929354770);
    projectF.updateStringTemplateInRecord(record as RecordNode<RT>, "variable_name_update_test", "variable_name_update_test_newer");
    expect(record?.props.text).to.be.equal("{{variable_name_update_test_newer}}");
  });

  it ("should add variable of type for a project", () => {
    const projectF = new ProjectFactory(threeScenesJson);
    const variableIdAndRecord = projectF.addVariableOfType(VariableType.boolean);
    expect(variableIdAndRecord?.record).to.not.be.undefined;
    expect(variableIdAndRecord?.record.props.var_type).to.be.equal(VariableType.boolean);
  });

  it ("should add pre defined variables for a project", () => {
    const projectF = new ProjectFactory(threeScenesJson);
    const variableIdAndRecord = projectF.addPredefinedVariable(PredefinedVariableName.scorm_suspend_data);
    expect(variableIdAndRecord?.record).to.not.be.undefined;
    expect(variableIdAndRecord?.record.name).to.be.equal("scorm_suspend_data");
  });

  it ("should add global variables for a project", () => {
    const projectF = new ProjectFactory(threeScenesJson);
    const variable = createRecord(RT.variable);
    const id = generateIdV2();
    const variableIdAndRecord = projectF.addGlobalVariable(variable, id);
    expect(variableIdAndRecord?.id).to.be.equal(id);
    expect(variableIdAndRecord?.record).to.not.be.undefined;
    expect(variableIdAndRecord?.record.props.var_category).to.be.equal("global");
  });
});