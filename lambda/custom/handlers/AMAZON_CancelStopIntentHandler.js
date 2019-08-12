// AMAZON_CancelIntentHandler.js

const handler = {
	canHandle(handlerInput) {
		const request = handlerInput.requestEnvelope.request;
		return request.type === 'IntentRequest' && 
			(request.intent.name === 'AMAZON.CancelIntent' || request.intent.name === 'AMAZON.StopIntent');
	},
	handle(handlerInput) {
		const { attributesManager, responseBuilder } = handlerInput;

		const rAttributes = attributesManager.getRequestAttributes();

		const speechText = rAttributes.t('FAREWELL_MESSAGE');

		return responseBuilder
			.speak(speechText)
			.withShouldEndSession(true)
			.getResponse();
	},
};

module.exports = handler;