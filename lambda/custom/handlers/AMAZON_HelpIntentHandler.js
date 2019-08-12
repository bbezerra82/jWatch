// AMAZON_HelpIntentHandler.js

const handler = {
	canHandle(handlerInput) {
		const request = handlerInput.requestEnvelope.request;
		return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.HelpIntent';
	},
	handle(handlerInput) {
		const responseBuilder = handlerInput.responseBuilder;

		let say = 'You asked for help. ';

		say += ' Here something you can ask me, ';

		return responseBuilder
			.speak(say)
			.reprompt('try again, ' + say)
			.getResponse();
	},
};

module.exports = handler;