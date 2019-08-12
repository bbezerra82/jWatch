// LaunchRequestHandler.js

const handler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'LaunchRequest';
    },
    handle(handlerInput) {
        const { responseBuilder, attributesManager } = handlerInput;
        const rAttributes = attributesManager.getRequestAttributes();

        const skillName = rAttributes.t('SKILL_NAME');
        const adjective = rAttributes.t('ADJECTIVES');
        const welcomeMessage = rAttributes.t('WELCOME_MESSAGE', skillName, adjective);

        let speechText = welcomeMessage;

        let reprompt = rAttributes.t('REPROMPT_MESSAGE');
        let favourites = '';

        // if favourites hasn't been set, then ask if user wants to set it
        // if (typeof favouritesProviders === 'undefined') {
        //   // favourites providers not set
        //   speechText += `It looks like you haven't set your favourite providers yet. You can do so by saying add, followed by the name of up to three providers. Or `
        //   favourites += `Or tell me which providers to add to your favourites list.`
        //   // reprompt += `Do you want to set your favourites providers now?`
        // }

        return responseBuilder
            .speak(speechText)
            .reprompt(reprompt)
            .getResponse();
    }
}

module.exports = handler;