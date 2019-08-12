// SearchIntentHandler.js

const utils = require('../lib/utils');
const w2s = require('../lib/WhereToStream');

const handler = {
	canHandle(handlerInput) {
		const request = handlerInput.requestEnvelope.request;
		return request.type === 'IntentRequest' && request.intent.name === 'SearchIntent';
	},
	async handle(handlerInput) {
		// perform the search
		results = await w2s.searchTitle(handlerInput);

		// read out the results and ask if it is the correct one
		return utils.readResults(results, handlerInput);
	}
};

module.exports = handler;