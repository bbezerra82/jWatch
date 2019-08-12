// ResponseLogInterceptor.js

module.exports = {
    process(response, handlerInput) {
		console.log(`\n************* RESPONSE **************\n${JSON.stringify(handlerInput)}`);
		return;
	}
}