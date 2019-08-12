// utils.js

// const JustWatch = require('justwatch-api')
const Alexa = require('ask-sdk');
const JSONQuery = require("json-query");
const searchJson = require('../lib/searchJson');
const tmbd = require('./tmbd');

// Session Attributes 
//   Alexa will track attributes for you, by default only during the lifespan of your session.
//   The history[] array will track previous request(s), used for contextual Help/Yes/No handling.
//   Set up DynamoDB persistence to have the skill save and reload these attributes between skill sessions.

let JW;

const LANGUAGE_STRINGS = {
	'en': require("../i18n/en"),
	'pt': require("../i18n/pt"),
}

function getMemoryAttributes() {
	const memoryAttributes = {
		"history": [],
		// "launchCount": 0,
		// "lastUseTimestamp": 0,
		// "lastSpeechOutput": {},
	};
	return memoryAttributes;
};

const MAX_HISTORY_SIZE = 10; // remember only latest 10 intents 

function getCustomIntents() {
	const modelIntents = model.interactionModel.languageModel.intents;

	let customIntents = [];


	for (let i = 0; i < modelIntents.length; i++) {

		if (modelIntents[i].name.substring(0, 7) != "AMAZON." && modelIntents[i].name !== "LaunchRequest") {
			customIntents.push(modelIntents[i]);
		}
	}
	return customIntents;
};

function randomElement(myArray) {
	return (myArray[Math.floor(Math.random() * myArray.length)]);
};

function getPreviousIntent(attrs) {

	if (attrs.history && attrs.history.length > 1) {
		return attrs.history[attrs.history.length - 2].IntentRequest;

	} else {
		return false;
	}
};

function getSampleUtterance(intent) {
	return randomElement(intent.samples);
}

function getSlotValues(filledSlots) {
	const slotValues = {};

	Object.keys(filledSlots).forEach((item) => {
		const name = filledSlots[item].name;

		if (filledSlots[item] &&
			filledSlots[item].resolutions &&
			filledSlots[item].resolutions.resolutionsPerAuthority[0] &&
			filledSlots[item].resolutions.resolutionsPerAuthority[0].status &&
			filledSlots[item].resolutions.resolutionsPerAuthority[0].status.code) {
			switch (filledSlots[item].resolutions.resolutionsPerAuthority[0].status.code) {
				case 'ER_SUCCESS_MATCH':
					slotValues[name] = {
						heardAs: filledSlots[item].value,
						resolved: filledSlots[item].resolutions.resolutionsPerAuthority[0].values[0].value.name,
						ERstatus: 'ER_SUCCESS_MATCH'
					};
					break;
				case 'ER_SUCCESS_NO_MATCH':
					slotValues[name] = {
						heardAs: filledSlots[item].value,
						resolved: '',
						ERstatus: 'ER_SUCCESS_NO_MATCH'
					};
					break;
				default:
					break;
			}
		} else {
			slotValues[name] = {
				heardAs: filledSlots[item].value || '', // may be null 
				resolved: '',
				ERstatus: ''
			};
		}
	}, this);

	return slotValues;
}

function prepareResults(searchResult) {
	// from the search return, collect the id and object_type
	let id = JSONQuery('[items].id', { data: searchResult }).value;
	let type = JSONQuery('[items].object_type', { data: searchResult }).value;

	let results = [];
	for (i = 0; (i < id.length); i++) {
		let item = {
			id: id[i],
			type: type[i],
		}
		results.push(item)
	}
	// console.log(`[INFO] prepareResults: ${JSON.stringify(results)}`);
	return results;
}

async function readResults(results, handlerInput) {
	// console.log(`[INFO] results: ${JSON.stringify(results)}`);
	const { attributesManager, responseBuilder, requestEnvelope } = handlerInput;
	const rAttributes = attributesManager.getRequestAttributes();
	let sAttributes = attributesManager.getSessionAttributes();
	let nextRead = sAttributes.nextRead || 0;

	const titleUserInput = sAttributes.titleUserInput || Alexa.getSlotValue(requestEnvelope, 'title');
	sAttributes.titleUserInput = titleUserInput;

	if (nextRead === results.length) {
		// console.log(`[INFO] nextRead > results.length`);

		const speechText = rAttributes.t('END_OF_RESULTS', titleUserInput) + rAttributes.t('END_OF_RESULTS_FOLLOW_UP');
		
		sAttributes.nextRead = 0;
		attributesManager.setSessionAttributes(sAttributes);

		return responseBuilder
			.speak(speechText)
			.withShouldEndSession(false)
			.getResponse();
	}

	const searchResult = await this.JW.getTitle(results[nextRead].type, results[nextRead].id);
	// console.log(`[INFO] searchResult: ${JSON.stringify(searchResult)}`);

	title = searchResult.title;
	release = searchResult.original_release_year;
	description = searchResult.short_description;
	externalId = searchResult.external_ids[1].external_id;
	objectType = searchResult.object_type;
	const locale = Alexa.getLocale(requestEnvelope);

	const imagestPath = await tmbd.getImages(externalId, objectType, locale);
	// console.log(`[INFO] tmbdResult: ${tmbdResult}`);
	// tmbdResult = JSON.parse(JSON.stringify(tmbdResult));
	// console.log(`[INFO] tmbdResult: ${tmbdResult}`);

	// const backdropPath = tmbdResult.backdrop_path;
	// const posterPath = tmdbResult.poster_path;
	console.log(`[INFO] backdropPath: ${imagestPath.backdrop}`);
	console.log(`[INFO] backdropUrl: https://image.tmdb.org/t/p/w1280${imagestPath.backdrop}`);
	console.log(`[INFO] posterPath: ${imagestPath.poster}`);
	console.log(`[INFO] posterPath: https://image.tmdb.org/t/p/${imagestPath.poster}`);

	let credits = '';
	for (i = 0; i < 3; i++) {
		credits += searchResult.credits[i].name + punctuation(i, 3, 'and');
	}

	// console.log(`[INFO] resultJson: ${JSON.stringify(resultJson)}`);

	const announcement = rAttributes.t('RESULT_MESSAGE', nextRead + 1, title, release, credits, description);
	const confirmation = rAttributes.t('CONFIRMATION_MESSAGE');
	let speechText = announcement + confirmation;

	nextRead++;
	sAttributes.nextRead = nextRead;
	attributesManager.setSessionAttributes(sAttributes);

	return responseBuilder
		.speak(speechText)
		.withShouldEndSession(false)
		.getResponse();
}

function readServices(results, handlerInput) {
	const { attributesManager, responseBuilder } = handlerInput;
	let speechText = '';
	const sAttributes = attributesManager.getSessionAttributes();
	const rAttributes = attributesManager.getRequestAttributes();

	// console.log(`[INFO] results: ${JSON.stringify(results)}`)
	const title = results.searchResult.title;
	sAttributes.title = title;
	// console.log(`[INFO] title: ${title}`);

	let monetization_type = JSONQuery(`offers.monetization_type`, { data: results.searchResult }).value;
	// console.log(`[INFO] monetization_type: ${JSON.stringify(monetization_type)}`)
	let provider_id = JSONQuery(`offers.provider_id`, { data: results.searchResult }).value;
	// console.log(`[INFO] provider_id: ${JSON.stringify(provider_id)}`)
	let presentation_type = JSONQuery(`offers.presentation_type`, { data: results.searchResult }).value;
	// console.log(`[INFO] presentation_type: ${JSON.stringify(presentation_type)}`)
	let retail_price = JSONQuery(`offers.retail_price`, { data: results.searchResult }).value;
	// console.log(`[INFO] retail_price: ${JSON.stringify(retail_price)}`)
	let currency = JSONQuery(`offers.currency`, { data: results.searchResult }).value;
	// console.log(`[INFO] currency: ${JSON.stringify(currency)}`)

	const categories = {
		flatrate: [],
		rent: [],
		buy: [],
		cinema: []
	}

	// const 

	let buy = [];
	let cinema = [];
	let flatrate = [];
	let rent = [];

	for (i = 0; i < results.searchResult.offers.length; i++) {
		let item = {
			provider_id: provider_id[i],
			monetization_type: monetization_type[i],
			presentation_type: presentation_type[i],
			retail_price: retail_price[i],
			currency: currency[i]
		}
		switch (monetization_type[i]) {
			case 'buy':
				buy.push(item);
				break;
			case 'cinema':
				cinema.push(item);
				break;
			case 'flatrate':
				flatrate.push(item);
				break;
			case 'rent':
				rent.push(item);
				break;
			default:
				console.log('[ERROR] switch/case failed');
				break;
		}
	}

	// console.log(`[INFO] `)

	if (flatrate.length !== 0) {
		speechText += rAttributes.t('YOU_CAN_STREAM', title) + readProviders(results.providersList, flatrate);
	} else {
		speechText += rAttributes.t('NO_STREAM', title)
	}

	if (rent.length !== 0 && buy.length !==0) {
		speechText += rAttributes.t('BUT_RENT_BUY') + rAttributes.t('RENT_BUY_FOLLOW_UP');
	} else if (rent.length != 0) {
		speechText += rAttributes.t('BUT_RENT') + rAttributes.t('RENT_BUY_FOLLOW_UP');
	} else if (buy.length != 0) {
		speechText += rAttributes.t('BUT_BUY') + rAttributes.t('RENT_BUY_FOLLOW_UP');
	}

	sAttributes.buy = buy;
	sAttributes.rent = rent;
	attributesManager.setSessionAttributes(sAttributes);

	// if (rent.length !== 0) {
	// 	speechText += `You can rent ${title} on `;
	// 	speechText += readProviders(results.providersList, rent);
	// }

	// if (buy.length != 0) {
	// 	speechText += `You can buy ${title} on `;
	// 	speechText += readProviders(results.providersList, buy);
	// }

	return responseBuilder
		.speak(speechText)
		.reprompt('')
		.getResponse();
}

function readProviders(providers, set) {
	let names = [];
	let ids = [];
	let output = '';
	let name = '';
	for (i = 0; i < set.length; i++) {
		const pid = set[i].provider_id;
		if (ids.indexOf(pid) < 0) {
			name = searchJson.getValues(searchJson.getObjects(providers, 'id', pid), 'clear_name');
			// console.log(`[INFO] name: ${name}`);
			// console.log(`[INFO] pid: ${pid}`);
			names.push(name);
			ids.push(pid);
		}
	}
	for (i = 0; i < names.length; i++) {
		output += names[i] + punctuation(i, names.length, 'or');
	}

	return output;
}

function punctuation(index, length, conjunction) {
	if (index + 2 === length) {
		return ` ${conjunction} `;
	} else if (index + 1 !== length) {
		return `, `;
	} else {
		return `. `;
	}
}

module.exports = {
	getCustomIntents,
	getMemoryAttributes,
	getPreviousIntent,
	getSampleUtterance,
	getSlotValues,
	JW,
	LANGUAGE_STRINGS,
	prepareResults,
	randomElement,
	readResults,
	readProviders,
	readServices,
}