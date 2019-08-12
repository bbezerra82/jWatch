// MoreIntentHandler.js

const utils = require('../lib/utils');
const w2s = require('../lib/WhereToStream');

const handler = {
    canHandle(handlerInput) {
        const request =  handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'MoreIntent';
    },
    handle(handlerInput) {
        // const { responseBuilder } = handlerInput;

        // let say = 'welcome to more intent';

        // return responseBuilder
        //     .speak(say) 
        //     .getResponse();
		const { attributesManager } = handlerInput;

		const sAttributes = attributesManager.getSessionAttributes();

		const previousIntent = utils.getPreviousIntent(sAttributes);

		if (previousIntent) {
			if (previousIntent === 'AMAZON.NoIntent') {
				return w2s.getServices(handlerInput)
			}
		}
    }
};

module.exports = handler;