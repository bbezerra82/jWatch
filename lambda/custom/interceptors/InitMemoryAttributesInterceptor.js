// InitMemoryAttributesInterceptor.js

const Alexa = require('ask-sdk');
const utils = require('../lib/utils');

module.exports = {
    process(handlerInput) {
        // console.log(`[INFO] InitMemoryAttributesInterceptor`);
        const { attributesManager, requestEnvelope } = handlerInput;
        if (Alexa.isNewSession(requestEnvelope)) {
            let sAttributes = {};
            sAttributes = attributesManager.getSessionAttributes();

            let memoryAttributes = utils.getMemoryAttributes();

            if (Object.keys(sAttributes).length === 0) {
                Object.keys(memoryAttributes).forEach(function (key) {  // initialize all attributes from global list 
                    sAttributes[key] = memoryAttributes[key];
                });
            }
            attributesManager.setSessionAttributes(sAttributes);
        }
    }
};