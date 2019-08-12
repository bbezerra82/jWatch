// AMAZON_NoIntentHandler.js

const utils = require('../lib/utils');

module.exports = {
	canHandle(handlerInput) {
		const request = handlerInput.requestEnvelope.request;
		return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.NoIntent';
	},
	handle(handlerInput) {

		const { attributesManager, responseBuilder } = handlerInput;

		const sAttributes = attributesManager.getSessionAttributes();

		const previousIntent = utils.getPreviousIntent(sAttributes);

		let speechText = '';

		if (previousIntent) {
			switch (previousIntent) {
				case 'SearchIntent':
					const results = sAttributes.results;
					return utils.readResults(results, handlerInput);
				case 'AMAZON.YesIntent':
					speechText = 'Ok, let me know if you want me to search for another movie or show, by saying search for followed by its title. You can also say help or exit.'
					return responseBuilder
						.speak(speechText)
						.withShouldEndSession(false)
						.getResponse();
				default:
					speechText = 'Something went wrong. Please try again.'
					return responseBuilder
						.speak(speechText)
						.withShouldEndSession(true)
						.return();
			}
		}
	}
};