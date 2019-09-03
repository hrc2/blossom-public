// var minTime = 0;

Blockly.Blocks['gesture_trigger'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("At")
        .appendField(new Blockly.FieldNumber(Math.round(videotime*10)/10, minTime, 9999999), "TIME")
        .appendField("seconds play")
        .appendField(new Blockly.FieldDropdown(gestureList), "GESTURE");
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("Loop")
        .appendField(new Blockly.FieldCheckbox("FALSE"), "LOOP");
    this.appendValueInput("ADJ")
        .setCheck("adj")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("Adjustments");
    this.setPreviousStatement(true, "gesture_trigger");
    this.setNextStatement(true, "gesture_trigger");
    this.setColour(230);
 this.setTooltip("Gesture trigger");
 this.setHelpUrl("help");
  }
};

Blockly.JavaScript['gesture_trigger'] = function(block) {


  if (block.getParent() != null) {
      block.setFieldValue(Math.max(block.getFieldValue('TIME'),block.getParent().getFieldValue('TIME')), 'TIME')
  }

  var number_time = block.getFieldValue('TIME');

  var dropdown_gesture = block.getFieldValue('GESTURE');
  var checkbox_loop = block.getFieldValue('LOOP') == 'TRUE';
  var value_adj = Blockly.JavaScript.valueToCode(block, 'ADJ', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.

  // minTime = Math.max(minTime, number_time);

  // minTime = block.
  var millis_str = "millis:"+number_time;
  var gesture_str = "gesture:'"+dropdown_gesture+"'";
  var loop_str = "loop:"+checkbox_loop;
  var adj_str = '';
  if (value_adj != '') {
      var adj_str = "adj:'?'+" + value_adj;
  }
  var trigger_str = '{'+millis_str+','+gesture_str+','+loop_str+','+adj_str+'}';

  var code = 'triggerList.push('+trigger_str+');\n';

  // make sure connected to original block
    var anc = block;
    while (anc.getParent() != null) {
        anc = anc.getParent();
    }
    if (anc.id != 'gesture_0') {
        code = '';
        return code;
    }
    minTime = number_time;
   
  return code;
};

Blockly.Blocks['adj'] = {
  init: function() {
    this.appendValueInput("ADJ_INPUT")
        .setCheck(["adj_num", "adj_param"])
        .appendField(new Blockly.FieldDropdown([["Speed","speed"], ["Amplitude","amp"], ["Posture","post"]]), "ADJ_TYPE");
    this.setOutput(true, null);
    this.setColour(230);
 this.setTooltip("");
 this.setHelpUrl("");
  }
};

Blockly.JavaScript['adj'] = function(block) {
  var dropdown_adj_type = block.getFieldValue('ADJ_TYPE');
  var value_input = Blockly.JavaScript.valueToCode(block, 'ADJ_INPUT', Blockly.JavaScript.ORDER_ATOMIC);
  if (value_input == '') {
    value_input = '1';
  }
  // TODO: Assemble JavaScript into code variable.
  var code = '"'+dropdown_adj_type+'='+value_input+'&"';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.Blocks['adj_num'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("multiply by")
        .appendField(new Blockly.FieldNumber(0, 0.5, 1.5, 0.01), "ADJ_NUM");
    this.setOutput(true, null);
    this.setColour(230);
 this.setTooltip("");
 this.setHelpUrl("");
  }
};

Blockly.JavaScript['adj_num'] = function(block) {
  var number_adj_num = block.getFieldValue('ADJ_NUM');
  // TODO: Assemble JavaScript into code variable.
  var code = number_adj_num;
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.Blocks['adj_param'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["High","HIGH"], ["Low","LOW"]]), "ADJ_PARAM");
    this.setOutput(true, null);
    this.setColour(230);
 this.setTooltip("");
 this.setHelpUrl("");
  }
};

Blockly.JavaScript['adj_param'] = function(block) {
  var dropdown_adj_param = block.getFieldValue('ADJ_PARAM');
  if (dropdown_adj_param == 'HIGH') {
    number_adj_param = 1.5;
  } else if (dropdown_adj_param == 'LOW') {
    number_adj_param = 0.7;
  }
  // TODO: Assemble JavaScript into code variable.
  var code = number_adj_param;
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_ATOMIC];
};