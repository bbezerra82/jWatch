// utils.js

// const i18n = require("i18next");
// const sprintf = require("i18next-sprintf-postprocessor");

async function startSkill(handlerInput) {


	return new Promise((resolve, reject) => {
		handlerInput.attributesManager.getPersistentAttributes()
			.then(async (pAttributes) => {
				const { responseBuilder, attributesManager } = handlerInput;

				let sAttributes = attributesManager.getSessionAttributes();
				const rAttributes = attributesManager.getRequestAttributes();

				// await initJw(handlerInput);

				// collect the favourites
				const { favouritesProviders } = pAttributes;

				const skillName = rAttributes.t('SKILL_NAME')

				sAttributes.skillState = 'mainMenu';

				let speechText = `Welcome to ${skillName}, your crazy skill to check where to stream movies and TV shows. `;
				let reprompt = '';
				let favourites = '';

				// if favourites hasn't been set, then ask if user wants to set it
				// if (typeof favouritesProviders === 'undefined') {
				//   // favourites providers not set
				//   speechText += `It looks like you haven't set your favourite providers yet. You can do so by saying add, followed by the name of up to three providers. Or `
				//   favourites += `Or tell me which providers to add to your favourites list.`
				//   // reprompt += `Do you want to set your favourites providers now?`
				// }

				speechText += `Just ask me to search for a movie or TV show and I will let you know in which service you can stream it, rent it or buy it.`;
				reprompt += `What movie or TV show do you want to watch? ${favourites}`

				attributesManager.setSessionAttributes(sAttributes);
				attributesManager.setPersistentAttributes(pAttributes);
				attributesManager.savePersistentAttributes();

				resolve(responseBuilder
					.speak(speechText)
					.reprompt(reprompt)
					.getResponse());
			})
			.catch((error) => {
				console.log(`[ERROR] Error: ${error}`);
				reject(error);
			})
	});
}

module.exports = {
    startSkill,
}