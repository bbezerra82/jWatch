// WhereToStream.js

const Alexa = require('ask-sdk');
const utils = require('../lib/utils');
const JSONQuery = require("json-query");

module.exports = {
	getServices,
	searchTitle,
}

async function searchTitle(handlerInput) {
	const { attributesManager, requestEnvelope } = handlerInput;

	const title = Alexa.getSlotValue(requestEnvelope, 'title');

	// perform the search
	const searchResult = await utils.JW.search({
		query: title,
	});

	// console.log(`[INFO] searchResult:\n${JSON.stringify(searchResult)}`);

	// streamline the results by getting just the id and type
	const searchResults = utils.prepareResults(searchResult);

	// console.log(`[INFO] searchResults:\n${JSON.stringify(searchResults)}`);

	// save the results in the session attributes
	const sAttributes = attributesManager.getSessionAttributes();
	sAttributes.results = searchResults;
	// sAttributes.title = title;
	attributesManager.setSessionAttributes(sAttributes);

	return searchResults;
}

async function getServices(handlerInput) {
	const { attributesManager } = handlerInput;
	const sAttributes = attributesManager.getSessionAttributes();

	const itemToRead = sAttributes.nextRead - 1 || 0;

	const id = sAttributes.results[itemToRead].id;
	const type = sAttributes.results[itemToRead].type;

	const providersList = await utils.JW.getProviders();
	// console.log(`[INFO] providers: ${JSON.stringify(providers, null, 4)}`)

	const searchResult = await utils.JW.getTitle(type, id);

	sAttributes.providersList = providersList;
	attributesManager.setSessionAttributes(sAttributes);

	const output = {
		searchResult, 
		providersList
	};

	return output;
}