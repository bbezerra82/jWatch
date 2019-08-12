// InitJustWatchInterceptor.js

const Alexa = require('ask-sdk');
const JustWatch = require('justwatch-api');
const utils = require ('../lib/utils');

module.exports = {
    process(handlerInput) {
        const { requestEnvelope } = handlerInput;

        if (Alexa.isNewSession(requestEnvelope)) {
            // console.log(`[INFO] new session`)
            const locale = Alexa.getLocale(requestEnvelope).replace('-', '_');
            utils.JW = new JustWatch({
                locale: locale
            });
        } else {
            // console.log(`[INFO] not new session`)
        }
    }
}