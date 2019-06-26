// index.js

const Alexa = require("ask-sdk");
// const JustWatch = require("justwatch-api");
// const searchJson = require("./searchJson.js");
// const utils = require("./utils");

// set up for persistance
// const { DynamoDbPersistenceAdapter } = require('ask-sdk-dynamodb-persistence-adapter');
// const persistenceAdapter = new DynamoDbPersistenceAdapter({
// 	tableName: 'JustStream',
// 	createTable: true
// });

// handlers
const AMAZON_CancelStopIntentHandler = require('./handlers/AMAZON_CancelStopIntentHandler');
const AMAZON_HelpIntentHandler = require('./handlers/AMAZON_HelpIntentHandler');
const AMAZON_NoIntentHandler = require('./handlers/AMAZON_NoIntentHandler');
const AMAZON_YesIntentHandler = require('./handlers/AMAZON_YesIntentHandler');
const SearchIntentHandler = require('./handlers/SearchIntentHandler');
const MoreIntentHandler = require('./handlers/MoreIntentHandler');
const LaunchRequestHandler = require('./handlers/LaunchRequestHandler');
const SessionEndedHandler = require('./handlers/SessionEndedHandler');
const ErrorHandler = require('./handlers/ErrorHandler');

// interceptors
const LocalisationInterceptor = require('./interceptors/LocalisationInterceptor');
const InitMemoryAttributesInterceptor = require('./interceptors/InitMemoryAttributesInterceptor');
const RequestLogInterceptor = require('./interceptors/RequestLogInterceptor');
const ResponseLogInterceptor = require('./interceptors/ResponseLogInterceptor');
const RequestHistoryInterceptor = require('./interceptors/RequestHistoryInterceptor');
const InitJustWatchInterceptor = require('./interceptors/InitJustWatchInterceptor');

// 4. Exports handler function and setup ===================================================
const skillBuilder = Alexa.SkillBuilders.custom();
exports.handler = skillBuilder
	.addRequestHandlers(
		AMAZON_CancelStopIntentHandler,
		AMAZON_HelpIntentHandler,
		AMAZON_NoIntentHandler,
		AMAZON_YesIntentHandler,
		SearchIntentHandler,
		MoreIntentHandler,
		LaunchRequestHandler,
		SessionEndedHandler
	)
	.addErrorHandlers(ErrorHandler)
	// .withPersistenceAdapter(persistenceAdapter)
	.addRequestInterceptors(
		InitJustWatchInterceptor,
		InitMemoryAttributesInterceptor,
		RequestHistoryInterceptor,
		LocalisationInterceptor,
		RequestLogInterceptor)
	.addResponseInterceptors(ResponseLogInterceptor)

	// .addResponseInterceptors(ResponseRecordSpeechOutputInterceptor)

	// .addRequestInterceptors(RequestPersistenceInterceptor)
	// .addResponseInterceptors(ResponsePersistenceInterceptor)

	// .withTableName("askMemorySkillTable")
	// .withAutoCreateTable(true)

	.lambda();



// 1. Constants ===========================================================================

// Here you can define static data, to be used elsewhere in your code.  For example: 
//    const myString = "Hello World";
//    const myArray  = [ "orange", "grape", "strawberry" ];
//    const myObject = { "city": "Boston",  "state":"Massachusetts" };

const APP_ID = undefined;  // TODO replace with your Skill ID (OPTIONAL).

const PAGE_SIZE = 5;


// const ADJECTIVES = [
// 	'goto',
// 	'best',
// 	'amazing',
// 	'awesome',
// 	'distinctive',
// ]

// 3.  Helper Functions ===================================================================

// async function getNextResults(handlerInput) {
// 	const { attributesManager, responseBuilder } = handlerInput;

// 	const sAttributes = attributesManager.getSessionAttributes();
// 	const results = sAttributes.results;

// 	let speechText = '';

// 	if (typeof results === 'undefined') {
// 		return responseBuilder
// 			.speak(`Which movie or series do you want to search for?`)
// 			// .withShouldEndSession(true)
// 			.getResponse()
// 	}

// 	const result = await readResult(results, handlerInput);
// 	console.log(`[INFO] result: ${JSON.stringify(result)}`);

// 	if (!result) {
// 		return responseBuilder
// 			.speak(`There are no more results. You can start a new search if you'd like.`)
// 			.getResponse();
// 	} else {

// 		const pos = sAttributes.nextRead + 1;

// 		speechText = `The <say-as interpret-as="ordinal">${pos}</say-as> result is ${result.title} from ${result.release}: ${result.description} Is this the result you wanted?`;
// 		speechText = speechText.replace('&', 'and');

// 		return responseBuilder
// 			.speak(speechText)
// 			.getResponse();
// 	}
// }

// function readProviders(providers, set) {
// 	let names = [];
// 	let ids = [];
// 	let output = '';
// 	let name = '';
// 	for (i = 0; i < set.length; i++) {
// 		let pid = set[i].provider_id;
// 		if (ids.indexOf(pid) < 0) {
// 			name = searchJson.getValues(searchJson.getObjects(providers, 'id', pid), 'clear_name');
// 			names.push(name);
// 			ids.push(pid);
// 		}
// 	}

// 	for (i = 0; i < names.length; i++) {
// 		output += `${names[i]}${punctuation(i, names.length)}`;
// 	}
// 	return output;
// }

// function punctuation(index, length) {
// 	console.log(`[INFO] index: ${index} | length: ${length}`)
// 	if (index + 2 === length) {
// 		return ` and `;
// 	} else if (index + 1 !== length) {
// 		return `, `;
// 	} else {
// 		return `. `;
// 	}
// }

// function capitalize(myString) {

// 	return myString.replace(/(?:^|\s)\S/g, function (a) { return a.toUpperCase(); });
// }

// function stripSpeak(str) {
// 	return (str.replace('<speak>', '').replace('</speak>', ''));
// }

// function getExampleSlotValues(intentName, slotName) {

// 	let examples = [];
// 	let slotType = '';
// 	let slotValuesFull = [];

// 	let intents = model.interactionModel.languageModel.intents;
// 	for (let i = 0; i < intents.length; i++) {
// 		if (intents[i].name == intentName) {
// 			let slots = intents[i].slots;
// 			for (let j = 0; j < slots.length; j++) {
// 				if (slots[j].name === slotName) {
// 					slotType = slots[j].type;

// 				}
// 			}
// 		}

// 	}
// 	let types = model.interactionModel.languageModel.types;
// 	for (let i = 0; i < types.length; i++) {
// 		if (types[i].name === slotType) {
// 			slotValuesFull = types[i].values;
// 		}
// 	}

// 	slotValuesFull = shuffleArray(slotValuesFull);

// 	examples.push(slotValuesFull[0].name.value);
// 	examples.push(slotValuesFull[1].name.value);
// 	if (slotValuesFull.length > 2) {
// 		examples.push(slotValuesFull[2].name.value);
// 	}


// 	return examples;
// }

// function sayArray(myData, penultimateWord = 'and') {
// 	let result = '';

// 	myData.forEach(function (element, index, arr) {

// 		if (index === 0) {
// 			result = element;
// 		} else if (index === myData.length - 1) {
// 			result += ` ${penultimateWord} ${element}`;
// 		} else {
// 			result += `, ${element}`;
// 		}
// 	});
// 	return result;
// }

// function supportsDisplay(handlerInput) // returns true if the skill is running on a device with a display (Echo Show, Echo Spot, etc.) 
// {                                      //  Enable your skill for display as shown here: https://alexa.design/enabledisplay 
// 	const hasDisplay =
// 		handlerInput.requestEnvelope.context &&
// 		handlerInput.requestEnvelope.context.System &&
// 		handlerInput.requestEnvelope.context.System.device &&
// 		handlerInput.requestEnvelope.context.System.device.supportedInterfaces &&
// 		handlerInput.requestEnvelope.context.System.device.supportedInterfaces.Display;

// 	return hasDisplay;
// }

// const welcomeCardImg = {
// 	smallImageUrl: "https://s3.amazonaws.com/skill-images-789/cards/card_plane720_480.png",
// 	largeImageUrl: "https://s3.amazonaws.com/skill-images-789/cards/card_plane1200_800.png"
// };

// const DisplayImg1 = {
// 	title: 'Jet Plane',
// 	url: 'https://s3.amazonaws.com/skill-images-789/display/plane340_340.png'
// };
// const DisplayImg2 = {
// 	title: 'Starry Sky',
// 	url: 'https://s3.amazonaws.com/skill-images-789/display/background1024_600.png'

// };


// function getPreviousSpeechOutput(attrs) {

// 	if (attrs.lastSpeechOutput && attrs.history.length > 1) {
// 		return attrs.lastSpeechOutput;

// 	} else {
// 		return false;
// 	}

// }

// function timeDelta(t1, t2) {

// 	const dt1 = new Date(t1);
// 	const dt2 = new Date(t2);
// 	const timeSpanMS = dt2.getTime() - dt1.getTime();
// 	const span = {
// 		"timeSpanMIN": Math.floor(timeSpanMS / (1000 * 60)),
// 		"timeSpanHR": Math.floor(timeSpanMS / (1000 * 60 * 60)),
// 		"timeSpanDAY": Math.floor(timeSpanMS / (1000 * 60 * 60 * 24)),
// 		"timeSpanDesc": ""
// 	};


// 	if (span.timeSpanHR < 2) {
// 		span.timeSpanDesc = span.timeSpanMIN + " minutes";
// 	} else if (span.timeSpanDAY < 2) {
// 		span.timeSpanDesc = span.timeSpanHR + " hours";
// 	} else {
// 		span.timeSpanDesc = span.timeSpanDAY + " days";
// 	}


// 	return span;

// }

// const RequestHistoryInterceptor = {
// 	process(handlerInput) {

// 		const thisRequest = handlerInput.requestEnvelope.request;
// 		let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

// 		let history = sessionAttributes['history'] || [];

// 		let IntentRequest = {};
// 		if (thisRequest.type === 'IntentRequest') {

// 			let slots = [];

// 			IntentRequest = {
// 				'IntentRequest': thisRequest.intent.name
// 			};

// 			if (thisRequest.intent.slots) {

// 				for (let slot in thisRequest.intent.slots) {
// 					let slotObj = {};
// 					slotObj[slot] = thisRequest.intent.slots[slot].value;
// 					slots.push(slotObj);
// 				}

// 				IntentRequest = {
// 					'IntentRequest': thisRequest.intent.name,
// 					'slots': slots
// 				};

// 			}

// 		} else {
// 			IntentRequest = { 'IntentRequest': thisRequest.type };
// 		}
// 		if (history.length > MAX_HISTORY_SIZE - 1) {
// 			history.shift();
// 		}
// 		history.push(IntentRequest);

// 		handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

// 	}

// };

// const RequestPersistenceInterceptor = {
// 	process(handlerInput) {

// 		if (handlerInput.requestEnvelope.session['new']) {

// 			return new Promise((resolve, reject) => {

// 				handlerInput.attributesManager.getPersistentAttributes()

// 					.then((sessionAttributes) => {
// 						sessionAttributes = sessionAttributes || {};


// 						sessionAttributes['launchCount'] += 1;

// 						handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

// 						handlerInput.attributesManager.savePersistentAttributes()
// 							.then(() => {
// 								resolve();
// 							})
// 							.catch((err) => {
// 								reject(err);
// 							});
// 					});

// 			});

// 		} // end session['new'] 
// 	}
// };


// const ResponseRecordSpeechOutputInterceptor = {
// 	process(handlerInput, responseOutput) {

// 		let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
// 		let lastSpeechOutput = {
// 			"outputSpeech": responseOutput.outputSpeech.ssml,
// 			"reprompt": responseOutput.reprompt.outputSpeech.ssml
// 		};

// 		sessionAttributes['lastSpeechOutput'] = lastSpeechOutput;

// 		handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

// 	}
// };

// const ResponsePersistenceInterceptor = {
// 	process(handlerInput, responseOutput) {

// 		const ses = (typeof responseOutput.shouldEndSession == "undefined" ? true : responseOutput.shouldEndSession);

// 		if (ses || handlerInput.requestEnvelope.request.type == 'SessionEndedRequest') { // skill was stopped or timed out 

// 			let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

// 			sessionAttributes['lastUseTimestamp'] = new Date(handlerInput.requestEnvelope.request.timestamp).getTime();

// 			handlerInput.attributesManager.setPersistentAttributes(sessionAttributes);

// 			return new Promise((resolve, reject) => {
// 				handlerInput.attributesManager.savePersistentAttributes()
// 					.then(() => {
// 						resolve();
// 					})
// 					.catch((err) => {
// 						reject(err);
// 					});

// 			});

// 		}

// 	}
// };

// function getSpeakableListOfProducts(entitleProductsList) {
// 	const productNameList = entitleProductsList.map(item => item.name);
// 	let productListSpeech = productNameList.join(', '); // Generate a single string with comma separated product names
// 	productListSpeech = productListSpeech.replace(/_([^_]*)$/, 'and $1'); // Replace last comma with an 'and '
// 	return productListSpeech;
// }


// function shuffleArray(array) {  // Fisher Yates shuffle! 

// 	let currentIndex = array.length, temporaryValue, randomIndex;

// 	while (0 !== currentIndex) {

// 		randomIndex = Math.floor(Math.random() * currentIndex);
// 		currentIndex -= 1;

// 		temporaryValue = array[currentIndex];
// 		array[currentIndex] = array[randomIndex];
// 		array[randomIndex] = temporaryValue;
// 	}

// 	return array;
// }

// End of Skill code -------------------------------------------------------------