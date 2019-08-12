// MoreIntentHandler.js

const utils = require('../lib/utils');


const handler = {
	canHandle(handlerInput) {
		const request = handlerInput.requestEnvelope.request;
		return request.type === 'IntentRequest' && request.intent.name === 'MoreIntent';
	},
	handle(handlerInput) {
		return utils.getNextResults(handlerInput);
	},
};

module.exports = handler;