const path = require('path');

const pluginName = 'codegen';
const codeModule = '@aws-amplify/amplify-codegen-core';

async function executeAmplifyCommand(context) {
  let commandPath = path.normalize(path.join(__dirname, '../commands'));
  commandPath = path.join(commandPath, pluginName, context.input.command);

  // Call types plugin:
  if(context.input.command=='types' && context.input.options!=undefined && 
  context.input.options['plugin']==true) {
    const temp = require(codeModule);
    await temp.run(context);
  }
  else {
    const commandModule = require(commandPath);
    await commandModule.run(context);
  }
}

async function handleAmplifyEvent(context, args) {
  context.print.info(`${pluginName} handleAmplifyEvent to be implemented`);
  context.print.info(`Received event args ${args}`);
}

module.exports = {
  executeAmplifyCommand,
  handleAmplifyEvent,
};
