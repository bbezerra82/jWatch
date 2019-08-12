// AMAZON_HelpIntentHandler.js

const utils = require('../lib/utils');

module.exports = {
	canHandle(handlerInput) {
		const request = handlerInput.requestEnvelope.request;
		return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.HelpIntent';
	},
	handle(handlerInput) {
		const request = handlerInput.requestEnvelope.request;
		const responseBuilder = handlerInput.responseBuilder;
		let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

		let history = sessionAttributes['history'];
		let intents = utils.getCustomIntents();
		let sampleIntent = utils.randomElement(intents);

		let say = 'You asked for help. ';

		let previousIntent = utils.getPreviousIntent(sessionAttributes);
		if (previousIntent && !handlerInput.requestEnvelope.session.new) {
			say += 'Your last intent was ' + previousIntent + '. ';
		}
		// say +=  'I understand  ' + intents.length + ' intents, '

		say += ' Here something you can ask me, ' + utils.getSampleUtterance(sampleIntent);

		return responseBuilder
			.speak(say)
			.reprompt('try again, ' + say)
			.getResponse();
	},
};