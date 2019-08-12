// AMAZON_YesIntentHandler.js

const utils = require('../lib/utils');
const w2s = require('../lib/WhereToStream');

const handler = {
	canHandle(handlerInput) {
		const request = handlerInput.requestEnvelope.request;
		return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.YesIntent';
	},
	async handle(handlerInput) {
		const { attributesManager, responseBuilder } = handlerInput;

		const sAttributes = attributesManager.getSessionAttributes();
		const rAttributes = attributesManager.getRequestAttributes();

		const previousIntent = utils.getPreviousIntent(sAttributes);

		if (previousIntent) {
			switch (previousIntent) {
				case 'SearchIntent':
				case 'AMAZON.NoIntent':
					const results = await w2s.getServices(handlerInput);

					return utils.readServices(results, handlerInput);
				case 'AMAZON.YesIntent':
					let speechText = '';
					const rent = sAttributes.rent;

					if (rent.length > 0) speechText += rAttributes.t('YOU_CAN_RENT', sAttributes.title) + utils.readProviders(sAttributes.providersList, rent);

					const buy = sAttributes.buy;

					if (buy.length > 0) speechText += rAttributes.t('YOU_CAN_BUY', sAttributes.title) + utils.readProviders(sAttributes.providersList, rent);

					return responseBuilder
						.speak(speechText)
						.getResponse();
				default:
					console.log('[ERROR] switch/case failed');
					return false;
			}
		}
	},
};

module.exports = handler;