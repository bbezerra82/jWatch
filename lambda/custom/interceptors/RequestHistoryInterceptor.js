// RequestHistoryInterceptor.js

const Alexa = require("ask-sdk");
const utils = require('../lib/utils');

module.exports = {
    process(handlerInput) {
        // console.log(`[INFO] RequestHistoryInterceptor`);
        const { attributesManager, requestEnvelope } = handlerInput;
        const { request } = requestEnvelope;
        let sAttributes = attributesManager.getSessionAttributes();

        let history = sAttributes['history'] || [];

        let IntentRequest = {};
        if (Alexa.getRequestType(requestEnvelope) === 'IntentRequest') {
            let slots = [];

            IntentRequest = {
                'IntentRequest': Alexa.getIntentName(requestEnvelope)
            };

            if (request.intent.slots) {
                for (let slot in request.intent.slots) {
                    let slotObj = {};
                    slotObj[slot] = request.intent.slots[slot].value;
                    slots.push(slotObj);
                }

                IntentRequest = {
                    'IntentRequest': Alexa.getIntentName(requestEnvelope),
                    'slots': slots
                };

            }

        } else {
            IntentRequest = { 
                'IntentRequest': Alexa.getRequestType(requestEnvelope) 
            };
        }
        if (history.length > utils.MAX_HISTORY_SIZE - 1) {
            history.shift();
        }
        history.push(IntentRequest);

        handlerInput.attributesManager.setSessionAttributes(sAttributes);
    }
};