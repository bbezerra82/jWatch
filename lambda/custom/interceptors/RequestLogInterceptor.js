// RequestLogInterceptor.js

module.exports = {
    process(handlerInput) {
		const { request } = handlerInput.requestEnvelope;
		const type = request.type;
		const locale = request.locale;
		if (type !== 'IntentRequest') {
			console.log(`[INFO] ${type} (${locale})`);
		} else {
			const name = request.intent.name;
			console.log('[INFO] ' + name + ' (' + locale + ')');
		}
		console.log(`\n********** REQUEST ENVELOPE *********\n${JSON.stringify(handlerInput)}`);
		return;
	}
}