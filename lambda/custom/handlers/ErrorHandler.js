// ErrorHandler.js

const handler = {
	canHandle() {
		return true;
	},
	handle(handlerInput, error) {
		const request = handlerInput.requestEnvelope.request;

		console.log(`Error handled: ${error.message}`);
		console.log(`Original Request was: ${JSON.stringify(request)}`);

		return handlerInput.responseBuilder
			.speak(`Sorry, your skill got this error.  ${error.message} `)
			.reprompt(`Sorry, your skill got this error.  ${error.message} `)
			.getResponse();
	}
};

module.exports = handler;