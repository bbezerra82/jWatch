// SessionEndedHandler.js

const handler = {
	canHandle(handlerInput) {
		const request = handlerInput.requestEnvelope.request;
		return request.type === 'SessionEndedRequest';
	},
	handle(handlerInput) {
		const request = handlerInput.requestEnvelope.request;
		console.log(`[INFO] Session ended with reason: ${request.reason}`);
		if (request.reason === 'ERROR') {
			console.log(`[ERROR] ${request.error.type}: ${request.error.message}`)
		}

		return handlerInput.responseBuilder.getResponse();
	}
};

module.exports = handler;