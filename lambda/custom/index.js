// index.js

const Alexa = require("ask-sdk");
const JustWatch = require("justwatch-api");
const JSONQuery = require("json-query");
const searchJson = require("./searchJson.js");
const i18n = require("i18next");
const sprintf = require("i18next-sprintf-postprocessor");
const utils = require("./utils");



// set up for persistance
const { DynamoDbPersistenceAdapter } = require('ask-sdk-dynamodb-persistence-adapter');
const persistenceAdapter = new DynamoDbPersistenceAdapter({
	tableName: 'JustStream',
	createTable: true
});

let JW;

// Session Attributes 
//   Alexa will track attributes for you, by default only during the lifespan of your session.
//   The history[] array will track previous request(s), used for contextual Help/Yes/No handling.
//   Set up DynamoDB persistence to have the skill save and reload these attributes between skill sessions.

function getMemoryAttributes() {
	const memoryAttributes = {
		"history": [],


		"launchCount": 0,
		"lastUseTimestamp": 0,

		"lastSpeechOutput": {},
	};
	return memoryAttributes;
};


// 1. Constants ===========================================================================

// Here you can define static data, to be used elsewhere in your code.  For example: 
//    const myString = "Hello World";
//    const myArray  = [ "orange", "grape", "strawberry" ];
//    const myObject = { "city": "Boston",  "state":"Massachusetts" };

const APP_ID = undefined;  // TODO replace with your Skill ID (OPTIONAL).

const PAGE_SIZE = 5;

const MAX_HISTORY_SIZE = 10; // remember only latest 10 intents 

const ADJECTIVES = [
	'goto',
	'best',
	'amazing',
	'awesome',
	'distinctive',
]

const LANGUAGE_STRINGS = {
	'en' : require("./i18n/en"),
	'pt' : require("./i18n/pt"),
}


// 2. Intent Handlers =============================================

const AMAZON_CancelIntent_Handler = {
	canHandle(handlerInput) {
		const request = handlerInput.requestEnvelope.request;
		return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.CancelIntent';
	},
	handle(handlerInput) {
		const request = handlerInput.requestEnvelope.request;
		const responseBuilder = handlerInput.responseBuilder;
		let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();


		let say = 'Okay, talk to you later! ';

		return responseBuilder
			.speak(say)
			.withShouldEndSession(true)
			.getResponse();
	},
};

const AMAZON_HelpIntent_Handler = {
	canHandle(handlerInput) {
		const request = handlerInput.requestEnvelope.request;
		return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.HelpIntent';
	},
	handle(handlerInput) {
		const request = handlerInput.requestEnvelope.request;
		const responseBuilder = handlerInput.responseBuilder;
		let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

		let history = sessionAttributes['history'];
		let intents = getCustomIntents();
		let sampleIntent = randomElement(intents);

		let say = 'You asked for help. ';

		let previousIntent = getPreviousIntent(sessionAttributes);
		if (previousIntent && !handlerInput.requestEnvelope.session.new) {
			say += 'Your last intent was ' + previousIntent + '. ';
		}
		// say +=  'I understand  ' + intents.length + ' intents, '

		say += ' Here something you can ask me, ' + getSampleUtterance(sampleIntent);

		return responseBuilder
			.speak(say)
			.reprompt('try again, ' + say)
			.getResponse();
	},
};

const AMAZON_NoIntent_Handler = {
	canHandle(handlerInput) {
		const request = handlerInput.requestEnvelope.request;
		return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.NoIntent';
	},
	handle(handlerInput) {
		const { attributesManager, responseBuilder } = handlerInput;
		const sAttributes = attributesManager.getSessionAttributes();

		const previousIntent = getPreviousIntent(sAttributes);
		let say = '';

		if (previousIntent === 'SearchIntent' || previousIntent === 'MoreIntent') {
			say = `If you want to hear more results, say more. If you want to search for another title, just ask me to search for it.`;

			return responseBuilder
				.speak(say)
				// .withShouldEndSession(false)
				.getResponse();
		}
	},
};

const AMAZON_YesIntent_Handler = {
	canHandle(handlerInput) {
		const request = handlerInput.requestEnvelope.request;
		return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.YesIntent';
	},
	async handle(handlerInput) {

		const { attributesManager } = handlerInput;

		const sAttributes = attributesManager.getSessionAttributes();

		let previousIntent = getPreviousIntent(sAttributes);

		if (previousIntent) {
			if (previousIntent === 'SearchIntent' || previousIntent === 'MoreIntent') {
				return getDetails(handlerInput)
			}
		}
	},
};

const AMAZON_StopIntent_Handler = {
	canHandle(handlerInput) {
		const request = handlerInput.requestEnvelope.request;
		return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.StopIntent';
	},
	handle(handlerInput) {
		const request = handlerInput.requestEnvelope.request;
		const responseBuilder = handlerInput.responseBuilder;
		let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();


		let say = 'Okay, talk to you later! ';

		return responseBuilder
			.speak(say)
			.withShouldEndSession(true)
			.getResponse();
	},
};

const MoreIntent_Handler = {
	canHandle(handlerInput) {
		const request = handlerInput.requestEnvelope.request;
		return request.type === 'IntentRequest' && request.intent.name === 'MoreIntent';
	},
	handle(handlerInput) {
		return getNextResults(handlerInput);
	},
};

const SearchIntent_Handler = {
	canHandle(handlerInput) {
		const request = handlerInput.requestEnvelope.request;
		return request.type === 'IntentRequest' && request.intent.name === 'SearchIntent';
	},
	handle(handlerInput) {
		const { attributesManager, } = handlerInput;
		let sAttributes = attributesManager.getSessionAttributes();
		sAttributes.skillState = 'SearchIntent';

		return searchTitle(handlerInput);
	},
};

const LaunchRequest_Handler = {
	canHandle(handlerInput) {
		const request = handlerInput.requestEnvelope.request;
		return request.type === 'LaunchRequest';
	},
	handle(handlerInput) {
		return utils.startSkill(handlerInput);
		// return startSkill(handlerInput);
	},
};

const SessionEndedHandler = {
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

const ErrorHandler = {
	canHandle() {
		return true;
	},
	handle(handlerInput, error) {
		const request = handlerInput.requestEnvelope.request;

		console.log(`Error handled: ${error.message}`);
		console.log(`Original Request was: ${JSON.stringify(request, null, 2)}`);

		return handlerInput.responseBuilder
			.speak(`Sorry, your skill got this error.  ${error.message} `)
			.reprompt(`Sorry, your skill got this error.  ${error.message} `)
			.getResponse();
	}
};

// 3.  Helper Functions ===================================================================

async function initJw(handlerInput) {
	if (!isJwInit()) {
		const { attributesManager } = handlerInput;
		let pAttributes;

		try {
			pAttributes = await attributesManager.getPersistentAttributes();
		} catch (e) {
			console.log(`[ERROR] Could not retrieve persistent attributes: ${e}`);
			return;
		}

		if (typeof JW === 'undefined') {
			const { requestEnvelope } = handlerInput
			const locale = pAttributes.locale;

			if (typeof locale === 'undefined') {
				locale = Alexa.getLocale(requestEnvelope).replace('-', '_');
				pAttributes.locale = locale;

				attributesManager.setPersistentAttributes(pAttributes);

				try {
					await attributesManager.savePersistentAttributes();
				} catch (e) {
					console.log(`[ERROR] Could not save persistent attributes: ${e}`);
					return;
				}
			}
			JW = new JustWatch({
				locale: locale
			});
		}
	}
}

function isJwInit() {
	return !(typeof JW === 'undefined')
}

function startSkill(handlerInput) {
	return new Promise((resolve, reject) => {
		handlerInput.attributesManager.getPersistentAttributes()
			.then(async (pAttributes) => {
				const { responseBuilder, attributesManager } = handlerInput;

				let sAttributes = attributesManager.getSessionAttributes();
				const rAttributes = attributesManager.getRequestAttributes();

				await initJw(handlerInput);

				// collect the favourites
				const { favouritesProviders } = pAttributes;

				const skillName = rAttributes.t('SKILL_NAME')

				sAttributes.skillState = 'mainMenu';

				let speechText = `Welcome to ${skillName}, your ${randomElement(ADJECTIVES)} skill to check where to stream movies and TV shows. `;
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

async function searchTitle(handlerInput) {
	const { responseBuilder, attributesManager, requestEnvelope } = handlerInput;

	const request = requestEnvelope.request;
	const sAttributes = attributesManager.getSessionAttributes();
	let speechText = '';
	let reprompt = '';

	let nextRead = sAttributes.nextRead;

	await initJw(handlerInput);

	const slotValues = getSlotValues(request.intent.slots);

	// get the title spoken by the user
	const titleValue = slotValues.title.heardAs;
	// console.log(`[INFO] titleValue = ${titleValue}`);

	// perform the actual search
	let searchResult = await JW.search({
		query: titleValue,
	});

	// get the only the id and type of the results
	const searchResults = prepareResults(searchResult);

	sAttributes.results = searchResults;

	speechText = 'Here is the top result: ';

	const topResult = await readResult(searchResults, handlerInput);
	console.log(`[INFO] topResult: ${JSON.stringify(topResult)}`);

	if (!topResult) {
		return responseBuilder
			.speak(`There are no more results. You can start a new search if you'd like.`)
			.getResponse();
	} else {

		speechText += `${topResult.title} from ${topResult.release}: ${topResult.description} Is this the one you were looking for?`;
		speechText = speechText.replace('&', 'and');

		attributesManager.setSessionAttributes(sAttributes);

		return responseBuilder
			.speak(speechText)
			.reprompt(reprompt)
			.getResponse();
	}
}

function prepareResults(searchResult) {
	// from the search return, collect the id, tittle, release year and short description
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

async function readResult(results, handlerInput) {
	// console.log(`[INFO] results: ${JSON.stringify(results)}`);
	const { attributesManager, responseBuilder } = handlerInput;
	let sAttributes = attributesManager.getSessionAttributes();
	let nextRead = sAttributes.nextRead;
	let resultJson = {};

	if (typeof nextRead === 'undefined') {
		nextRead = 0;
	} else {
		nextRead++;
	}

	if (nextRead === results.length) {
		console.log(`[INFO] nextRead > results.length`);
		sAttributes.nextRead = undefined;
		sAttributes.results = undefined;

		attributesManager.setSessionAttributes(sAttributes);
		return false;
	}

	await isJwInit();

	const searchResult = await JW.getTitle(results[nextRead].type, results[nextRead].id);
	// console.log(`[INFO] searchResult: ${JSON.stringify(searchResult)}`);

	// let resultJson = {};
	resultJson.title = searchResult.title;
	resultJson.release = searchResult.original_release_year;
	resultJson.description = searchResult.short_description;
	// console.log(`[INFO] resultJson: ${JSON.stringify(resultJson)}`);

	sAttributes.nextRead = nextRead;

	attributesManager.setSessionAttributes(sAttributes);

	return resultJson;
}

async function getNextResults(handlerInput) {
	const { attributesManager, responseBuilder } = handlerInput;

	const sAttributes = attributesManager.getSessionAttributes();
	const results = sAttributes.results;

	let speechText = '';

	if (typeof results === 'undefined') {
		return responseBuilder
			.speak(`Which movie or series do you want to search for?`)
			// .withShouldEndSession(true)
			.getResponse()
	}

	const result = await readResult(results, handlerInput);
	console.log(`[INFO] result: ${JSON.stringify(result)}`);

	if (!result) {
		return responseBuilder
			.speak(`There are no more results. You can start a new search if you'd like.`)
			.getResponse();
	} else {

		const pos = sAttributes.nextRead + 1;

		speechText = `The <say-as interpret-as="ordinal">${pos}</say-as> result is ${result.title} from ${result.release}: ${result.description} Is this the result you wanted?`;
		speechText = speechText.replace('&', 'and');

		return responseBuilder
			.speak(speechText)
			.getResponse();
	}
}

async function getDetails(handlerInput) {
	const { attributesManager, responseBuilder } = handlerInput;
	let speechText = '';
	const sAttributes = attributesManager.getSessionAttributes();

	await initJw();
	const itemToRead = sAttributes.nextRead;
	console.log(`[INFO] itemToRead: ${itemToRead}`);

	const id = sAttributes.results[itemToRead].id;
	const type = sAttributes.results[itemToRead].type;

	let providers = await JW.getProviders();
	// console.log(`[INFO] providers: ${JSON.stringify(providers, null, 4)}`)

	let searchResult = await JW.getTitle(type, id);
	console.log(`[INFO] result: ${JSON.stringify(searchResult, null, 4)}`)
	const title = searchResult.title;

	let monetization_type = JSONQuery(`offers.monetization_type`, { data: searchResult }).value;
	let provider_id = JSONQuery(`offers.provider_id`, { data: searchResult }).value;
	let presentation_type = JSONQuery(`offers.presentation_type`, { data: searchResult }).value;
	let retail_price = JSONQuery(`offers.retail_price`, { data: searchResult }).value;
	let currency = JSONQuery(`offers.currency`, { data: searchResult }).value;

	let buy = [];
	let cinema = [];
	let flatrate = [];
	let rent = [];

	for (i = 0; i < searchResult.offers.length; i++) {
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

	if (flatrate.length !== 0) {
		speechText += `You can stream ${title} on `;
		speechText += readProviders(providers, flatrate);
	}

	if (rent.length !== 0) {
		speechText += `You can rent ${title} on `;
		speechText += readProviders(providers, rent);
	}

	if (buy.length != 0) {
		speechText += `You can buy ${title} on `;
		speechText += readProviders(providers, buy);
	}

	return responseBuilder
		.speak(speechText)
		.getResponse();
}

function readProviders(providers, set) {
	let names = [];
	let ids = [];
	let output = '';
	let name = '';
	for (i = 0; i < set.length; i++) {
		let pid = set[i].provider_id;
		if (ids.indexOf(pid) < 0) {
			name = searchJson.getValues(searchJson.getObjects(providers, 'id', pid), 'clear_name');
			names.push(name);
			ids.push(pid);
		}
	}

	for (i = 0; i < names.length; i++) {
		output += `${names[i]}${punctuation(i, names.length)}`;
	}
	return output;
}

function punctuation(index, length) {
	console.log(`[INFO] index: ${index} | length: ${length}`)
	if (index + 2 === length) {
		return ` and `;
	} else if (index + 1 !== length) {
		return `, `;
	} else {
		return `. `;
	}
}

function capitalize(myString) {

	return myString.replace(/(?:^|\s)\S/g, function (a) { return a.toUpperCase(); });
}

function randomElement(myArray) {
	return (myArray[Math.floor(Math.random() * myArray.length)]);
}

function stripSpeak(str) {
	return (str.replace('<speak>', '').replace('</speak>', ''));
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

function getExampleSlotValues(intentName, slotName) {

	let examples = [];
	let slotType = '';
	let slotValuesFull = [];

	let intents = model.interactionModel.languageModel.intents;
	for (let i = 0; i < intents.length; i++) {
		if (intents[i].name == intentName) {
			let slots = intents[i].slots;
			for (let j = 0; j < slots.length; j++) {
				if (slots[j].name === slotName) {
					slotType = slots[j].type;

				}
			}
		}

	}
	let types = model.interactionModel.languageModel.types;
	for (let i = 0; i < types.length; i++) {
		if (types[i].name === slotType) {
			slotValuesFull = types[i].values;
		}
	}

	slotValuesFull = shuffleArray(slotValuesFull);

	examples.push(slotValuesFull[0].name.value);
	examples.push(slotValuesFull[1].name.value);
	if (slotValuesFull.length > 2) {
		examples.push(slotValuesFull[2].name.value);
	}


	return examples;
}

function sayArray(myData, penultimateWord = 'and') {
	let result = '';

	myData.forEach(function (element, index, arr) {

		if (index === 0) {
			result = element;
		} else if (index === myData.length - 1) {
			result += ` ${penultimateWord} ${element}`;
		} else {
			result += `, ${element}`;
		}
	});
	return result;
}

function supportsDisplay(handlerInput) // returns true if the skill is running on a device with a display (Echo Show, Echo Spot, etc.) 
{                                      //  Enable your skill for display as shown here: https://alexa.design/enabledisplay 
	const hasDisplay =
		handlerInput.requestEnvelope.context &&
		handlerInput.requestEnvelope.context.System &&
		handlerInput.requestEnvelope.context.System.device &&
		handlerInput.requestEnvelope.context.System.device.supportedInterfaces &&
		handlerInput.requestEnvelope.context.System.device.supportedInterfaces.Display;

	return hasDisplay;
}

const welcomeCardImg = {
	smallImageUrl: "https://s3.amazonaws.com/skill-images-789/cards/card_plane720_480.png",
	largeImageUrl: "https://s3.amazonaws.com/skill-images-789/cards/card_plane1200_800.png"
};

const DisplayImg1 = {
	title: 'Jet Plane',
	url: 'https://s3.amazonaws.com/skill-images-789/display/plane340_340.png'
};
const DisplayImg2 = {
	title: 'Starry Sky',
	url: 'https://s3.amazonaws.com/skill-images-789/display/background1024_600.png'

};

function getCustomIntents() {
	const modelIntents = model.interactionModel.languageModel.intents;

	let customIntents = [];


	for (let i = 0; i < modelIntents.length; i++) {

		if (modelIntents[i].name.substring(0, 7) != "AMAZON." && modelIntents[i].name !== "LaunchRequest") {
			customIntents.push(modelIntents[i]);
		}
	}
	return customIntents;
}

function getSampleUtterance(intent) {

	return randomElement(intent.samples);

}

function getPreviousIntent(attrs) {

	if (attrs.history && attrs.history.length > 1) {
		return attrs.history[attrs.history.length - 2].IntentRequest;

	} else {
		return false;
	}

}

function getPreviousSpeechOutput(attrs) {

	if (attrs.lastSpeechOutput && attrs.history.length > 1) {
		return attrs.lastSpeechOutput;

	} else {
		return false;
	}

}

function timeDelta(t1, t2) {

	const dt1 = new Date(t1);
	const dt2 = new Date(t2);
	const timeSpanMS = dt2.getTime() - dt1.getTime();
	const span = {
		"timeSpanMIN": Math.floor(timeSpanMS / (1000 * 60)),
		"timeSpanHR": Math.floor(timeSpanMS / (1000 * 60 * 60)),
		"timeSpanDAY": Math.floor(timeSpanMS / (1000 * 60 * 60 * 24)),
		"timeSpanDesc": ""
	};


	if (span.timeSpanHR < 2) {
		span.timeSpanDesc = span.timeSpanMIN + " minutes";
	} else if (span.timeSpanDAY < 2) {
		span.timeSpanDesc = span.timeSpanHR + " hours";
	} else {
		span.timeSpanDesc = span.timeSpanDAY + " days";
	}


	return span;

}

const LocalisationInterceptor = {
	process(handlerInput) {
		const localisationClient = i18n.use(sprintf).init({
			lng: handlerInput.requestEnvelope.request.locale,
			fallbackLng: 'en', // fallback to EN if locale doesn't exist
			resources: LANGUAGE_STRINGS
		});

		localisationClient.localise = function() {
			const args = arguments;
			let values = [];

			for (var i = 0; i < args.length; i++) {
				values.push(args[i]);
			}

			const value = i18n.t(args[0], {
				returnObjects: true,
				postProcess: 'sprintf',
				sprintf: values
			});

			if (Array.isArray(value)) {
				return value[Math.floor(Math.random() * value.length)];
			} else {
				return value;
			}
		}

		const attributes = handlerInput.attributesManager.getRequestAttributes();
		attributes.t = function(...args) { 
			return localisationClient.localise(...args);
		};
	},
};

const LogInterceptor = {
	process(handlerInput) {
		const type = Alexa.getRequestType(handlerInput.requestEnvelope);
		const locale = Alexa.getLocale(handlerInput.requestEnvelope);
		if (type !== 'IntentRequest') {
			console.log(`[INFO] ${type} (${locale})`);
		} else {
			console.log('[INFO] ' + handlerInput.requestEnvelope.request.intent.name + ' (' + locale + ')');
		}
		console.log("\n" + "********** REQUEST ENVELOPE *********\n" +
			JSON.stringify(handlerInput, null, 4));
	}
}

const InitMemoryAttributesInterceptor = {
	process(handlerInput) {
		let sessionAttributes = {};
		if (handlerInput.requestEnvelope.session['new']) {

			sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

			let memoryAttributes = getMemoryAttributes();

			if (Object.keys(sessionAttributes).length === 0) {

				Object.keys(memoryAttributes).forEach(function (key) {  // initialize all attributes from global list 

					sessionAttributes[key] = memoryAttributes[key];

				});

			}
			handlerInput.attributesManager.setSessionAttributes(sessionAttributes);


		}
	}
};

const RequestHistoryInterceptor = {
	process(handlerInput) {

		const thisRequest = handlerInput.requestEnvelope.request;
		let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

		let history = sessionAttributes['history'] || [];

		let IntentRequest = {};
		if (thisRequest.type === 'IntentRequest') {

			let slots = [];

			IntentRequest = {
				'IntentRequest': thisRequest.intent.name
			};

			if (thisRequest.intent.slots) {

				for (let slot in thisRequest.intent.slots) {
					let slotObj = {};
					slotObj[slot] = thisRequest.intent.slots[slot].value;
					slots.push(slotObj);
				}

				IntentRequest = {
					'IntentRequest': thisRequest.intent.name,
					'slots': slots
				};

			}

		} else {
			IntentRequest = { 'IntentRequest': thisRequest.type };
		}
		if (history.length > MAX_HISTORY_SIZE - 1) {
			history.shift();
		}
		history.push(IntentRequest);

		handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

	}

};

const RequestPersistenceInterceptor = {
	process(handlerInput) {

		if (handlerInput.requestEnvelope.session['new']) {

			return new Promise((resolve, reject) => {

				handlerInput.attributesManager.getPersistentAttributes()

					.then((sessionAttributes) => {
						sessionAttributes = sessionAttributes || {};


						sessionAttributes['launchCount'] += 1;

						handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

						handlerInput.attributesManager.savePersistentAttributes()
							.then(() => {
								resolve();
							})
							.catch((err) => {
								reject(err);
							});
					});

			});

		} // end session['new'] 
	}
};


const ResponseRecordSpeechOutputInterceptor = {
	process(handlerInput, responseOutput) {

		let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
		let lastSpeechOutput = {
			"outputSpeech": responseOutput.outputSpeech.ssml,
			"reprompt": responseOutput.reprompt.outputSpeech.ssml
		};

		sessionAttributes['lastSpeechOutput'] = lastSpeechOutput;

		handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

	}
};

const ResponsePersistenceInterceptor = {
	process(handlerInput, responseOutput) {

		const ses = (typeof responseOutput.shouldEndSession == "undefined" ? true : responseOutput.shouldEndSession);

		if (ses || handlerInput.requestEnvelope.request.type == 'SessionEndedRequest') { // skill was stopped or timed out 

			let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

			sessionAttributes['lastUseTimestamp'] = new Date(handlerInput.requestEnvelope.request.timestamp).getTime();

			handlerInput.attributesManager.setPersistentAttributes(sessionAttributes);

			return new Promise((resolve, reject) => {
				handlerInput.attributesManager.savePersistentAttributes()
					.then(() => {
						resolve();
					})
					.catch((err) => {
						reject(err);
					});

			});

		}

	}
};

function getSpeakableListOfProducts(entitleProductsList) {
	const productNameList = entitleProductsList.map(item => item.name);
	let productListSpeech = productNameList.join(', '); // Generate a single string with comma separated product names
	productListSpeech = productListSpeech.replace(/_([^_]*)$/, 'and $1'); // Replace last comma with an 'and '
	return productListSpeech;
}


function shuffleArray(array) {  // Fisher Yates shuffle! 

	let currentIndex = array.length, temporaryValue, randomIndex;

	while (0 !== currentIndex) {

		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;

		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}

	return array;
}

// 4. Exports handler function and setup ===================================================
const skillBuilder = Alexa.SkillBuilders.custom();
exports.handler = skillBuilder
	.addRequestHandlers(
		AMAZON_CancelIntent_Handler,
		AMAZON_HelpIntent_Handler,
		AMAZON_StopIntent_Handler,
		AMAZON_NoIntent_Handler,
		AMAZON_YesIntent_Handler,
		SearchIntent_Handler,
		MoreIntent_Handler,
		LaunchRequest_Handler,
		SessionEndedHandler
	)
	.addErrorHandlers(ErrorHandler)
	.withPersistenceAdapter(persistenceAdapter)
	.addRequestInterceptors(InitMemoryAttributesInterceptor,
		RequestHistoryInterceptor,
		LocalisationInterceptor,
		LogInterceptor)
	.addResponseInterceptors(function (response, handlerInput) {
		console.log("\n" + "************* RESPONSE **************\n" +
			JSON.stringify(handlerInput, null, 4));
	})

	// .addResponseInterceptors(ResponseRecordSpeechOutputInterceptor)

	// .addRequestInterceptors(RequestPersistenceInterceptor)
	// .addResponseInterceptors(ResponsePersistenceInterceptor)

	// .withTableName("askMemorySkillTable")
	// .withAutoCreateTable(true)

	.lambda();


// End of Skill code -------------------------------------------------------------