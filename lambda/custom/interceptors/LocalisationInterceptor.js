// LocalisationInterceptor.js

const i18n = require("i18next");
const sprintf = require("i18next-sprintf-postprocessor");
const utils = require("../lib/utils");

module.exports = {
    process(handlerInput) {
        const localisationClient = i18n.use(sprintf).init({
            lng: handlerInput.requestEnvelope.request.locale,
            fallbackLng: 'en', // fallback to EN if locale doesn't exist
            resources: utils.LANGUAGE_STRINGS
        });

        localisationClient.localise = function () {
            const args = arguments;
            let values = [];

            for (i = 1; i < args.length; i++) {
                values.push(args[i]);
            }

            const value = i18n.t(args[0], {
                returnObjects: true,
                postProcess: 'sprintf',
                sprintf: values
            });

            if (Array.isArray(value)) {
                return utils.randomElement(value);
            } else {
                return value;
            }
        }

        const attributes = handlerInput.attributesManager.getRequestAttributes();
        attributes.t = function (...args) {
            return localisationClient.localise(...args);
        };
    },
};
