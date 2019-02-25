// Lambda Function code for Alexa.
// Paste this into your index.js file. 

const Alexa = require("ask-sdk-core");
const JustWatch = require("justwatch-api");
const JSONQuery = require("json-query");
const searchJson = require("./searchJson.js");

// set up for persistance
const { DynamoDbPersistenceAdapter } = require('ask-sdk-dynamodb-persistence-adapter');
const persistenceAdapter = new DynamoDbPersistenceAdapter({
  tableName: 'JustStream',
  createTable: true
});

const ADJECTIVES = [
  'goto',
  'best',
  'amazing',
  'awesome',
  'distinctive',
]

const skillName = "just stream";

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
    // "nextIntent":[]

    // "favoriteColor":"",
    // "name":"",
    // "namePronounce":"",
    // "email":"",
    // "mobileNumber":"",
    // "city":"",
    // "state":"",
    // "postcode":"",
    // "birthday":"",
    // "bookmark":0,
    // "wishlist":[],
  };
  return memoryAttributes;
};

const maxHistorySize = 20; // remember only latest 20 intents 


// 1. Intent Handlers =============================================

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

const AMAZON_MoreIntent_Handler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.MoreIntent';
  },
  handle(handlerInput) {
    const responseBuilder = handlerInput.responseBuilder;

    let say = 'Hello from AMAZON.MoreIntent. ';


    return responseBuilder
      .speak(say)
      .reprompt('try again, ' + say)
      .getResponse();
  },
};

const AMAZON_NavigateSettingsIntent_Handler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.NavigateSettingsIntent';
  },
  handle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    const responseBuilder = handlerInput.responseBuilder;
    let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    let say = 'Hello from AMAZON.NavigateSettingsIntent. ';


    return responseBuilder
      .speak(say)
      .reprompt('try again, ' + say)
      .getResponse();
  },
};

const AMAZON_NextIntent_Handler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.NextIntent';
  },
  handle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    const responseBuilder = handlerInput.responseBuilder;
    let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    let say = 'Hello from AMAZON.NextIntent. ';


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

    if (previousIntent === 'SearchIntent') {
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
      if (previousIntent === 'SearchIntent') {
        return getDetails(handlerInput)
      }
    }
  },
};

const AMAZON_PageDownIntent_Handler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.PageDownIntent';
  },
  handle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    const responseBuilder = handlerInput.responseBuilder;
    let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    let say = 'Hello from AMAZON.PageDownIntent. ';


    return responseBuilder
      .speak(say)
      .reprompt('try again, ' + say)
      .getResponse();
  },
};

const AMAZON_NavigateHomeIntent_Handler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.NavigateHomeIntent';
  },
  handle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    const responseBuilder = handlerInput.responseBuilder;
    let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    let say = 'Hello from AMAZON.NavigateHomeIntent. ';


    return responseBuilder
      .speak(say)
      .reprompt('try again, ' + say)
      .getResponse();
  },
};

const AMAZON_PageUpIntent_Handler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.PageUpIntent';
  },
  handle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    const responseBuilder = handlerInput.responseBuilder;
    let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    let say = 'Hello from AMAZON.PageUpIntent. ';


    return responseBuilder
      .speak(say)
      .reprompt('try again, ' + say)
      .getResponse();
  },
};

const AMAZON_PreviousIntent_Handler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.PreviousIntent';
  },
  handle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    const responseBuilder = handlerInput.responseBuilder;
    let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    let say = 'Hello from AMAZON.PreviousIntent. ';


    return responseBuilder
      .speak(say)
      .reprompt('try again, ' + say)
      .getResponse();
  },
};

const AMAZON_RepeatIntent_Handler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.RepeatIntent';
  },
  handle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    const responseBuilder = handlerInput.responseBuilder;
    let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    let previousSpeech = getPreviousSpeechOutput(sessionAttributes);

    return responseBuilder
      .speak('sure, I said, ' + stripSpeak(previousSpeech.outputSpeech))
      .reprompt(stripSpeak(previousSpeech.reprompt))
      .getResponse();
  },
};

const AMAZON_ScrollDownIntent_Handler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.ScrollDownIntent';
  },
  handle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    const responseBuilder = handlerInput.responseBuilder;
    let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    let say = 'Hello from AMAZON.ScrollDownIntent. ';


    return responseBuilder
      .speak(say)
      .reprompt('try again, ' + say)
      .getResponse();
  },
};

const AMAZON_ScrollLeftIntent_Handler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.ScrollLeftIntent';
  },
  handle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    const responseBuilder = handlerInput.responseBuilder;
    let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    let say = 'Hello from AMAZON.ScrollLeftIntent. ';


    return responseBuilder
      .speak(say)
      .reprompt('try again, ' + say)
      .getResponse();
  },
};

const AMAZON_ScrollRightIntent_Handler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.ScrollRightIntent';
  },
  handle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    const responseBuilder = handlerInput.responseBuilder;
    let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    let say = 'Hello from AMAZON.ScrollRightIntent. ';


    return responseBuilder
      .speak(say)
      .reprompt('try again, ' + say)
      .getResponse();
  },
};

const AMAZON_ScrollUpIntent_Handler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.ScrollUpIntent';
  },
  handle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    const responseBuilder = handlerInput.responseBuilder;
    let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    let say = 'Hello from AMAZON.ScrollUpIntent. ';


    return responseBuilder
      .speak(say)
      .reprompt('try again, ' + say)
      .getResponse();
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
    const { attributesManager,  } = handlerInput;
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
    return startSkill(handlerInput);
  },
};

const SessionEndedHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);
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


// 2. Constants ===========================================================================

// Here you can define static data, to be used elsewhere in your code.  For example: 
//    const myString = "Hello World";
//    const myArray  = [ "orange", "grape", "strawberry" ];
//    const myObject = { "city": "Boston",  "state":"Massachusetts" };

const APP_ID = undefined;  // TODO replace with your Skill ID (OPTIONAL).

const PAGE_SIZE = 5;

// 3.  Helper Functions ===================================================================

function startSkill(handlerInput) {
  return new Promise((resolve, reject) => {
    handlerInput.attributesManager.getPersistentAttributes()
      .then((pAttributes) => {
        const { responseBuilder, attributesManager, requestEnvelope } = handlerInput;

        let sAttributes = attributesManager.getSessionAttributes();

        // set locale
        let locale = pAttributes.locale;

        // if locale has not been set yet, get from request envelope
        if (typeof locale === undefined) {
          locale = requestEnvelope.request.locale.replace('-', '_');
          pAttributes.locale = locale;
        }

        // collect the favourites
        const { favouritesProviders } = pAttributes;

        sAttributes.skillState = 'mainMenu';

        let speechText = `Welcome to ${skillName}, your ${randomElement(ADJECTIVES)} skill to check where to stream movies and TV shows. `;
        let reprompt = '';
        let favourites = '';

        // if favourites hasn't been set, then ask if user wants to set it
        // if (typeof favouritesProviders === undefined) {
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

function searchTitle(handlerInput) {
  return new Promise((resolve, reject) => {
    const { responseBuilder, attributesManager, requestEnvelope } = handlerInput;
    attributesManager.getPersistentAttributes()
      .then(async (pAttributes) => {
        const request = requestEnvelope.request;
        let speechText = '';
        let reprompt = '';

        // set the locale for search
        let locale = pAttributes.locale;

        // if locale has not been set, get it from request envelope
        if (typeof locale === undefined) {
          locale = request.locale.replace('-', '_');
          pAttributes.locale = locale;
        }

        let jw = new JustWatch({
          locale: locale
        });

        let slotValues = getSlotValues(request.intent.slots);

        // console.log(`[INFO] slotValues = ${JSON.stringify(slotValues, null, 4)}`);
        // get the title spoken by the user
        let titleValue = slotValues.title.heardAs;
        // console.log(`[INFO] titleValue = ${titleValue}`);

        // perform the actual search
        let searchResult = await jw.search({
          query: titleValue,
          page_size: PAGE_SIZE
        });

        // console.log(`[INFO] searchResult = ${JSON.stringify(searchResult, null, 4)}`);

        // get the PAGE_SIZE first results
        let searchResults = prepareResults(searchResult);

        // console.log(`[INFO] searchResults = ${JSON.stringify(searchResults, null, 4)}`);

        sAttributes = attributesManager.getSessionAttributes();

        let results = [];

        // store the id of the results for further reference
        for (i = 0; i < searchResults.length; i++) {
          let item = {
            id: searchResults[i].id,
            type: searchResults[i].type
          }
          results.push(item);
        }

        sAttributes.results = results;

        speechText = 'Here is the top result: ';

        const topResult = readResult(searchResults, attributesManager);

        speechText += `${topResult.title} from ${topResult.release}: ${topResult.description} Is this the one you were looking for?`;

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
  })
}

function readResult(searchResults, attributesManager) {
  let sAttributes = attributesManager.getSessionAttributes();
  let nextRead = sAttributes.nextRead;

  if (nextRead === undefined) {
    nextRead = 0;
  } else {
    nextRead++;
  }

  let result = {};
  result.title = searchResults[nextRead].title;
  result.release = searchResults[nextRead].release;
  result.description = searchResults[nextRead].description;

  sAttributes.nextRead = nextRead;
  attributesManager.setSessionAttributes(sAttributes);

  return result;
}

function prepareResults(searchResult) {
  // from the search return, collect the id, tittle, release year and short description
  let id = JSONQuery('[items].id', { data: searchResult }).value;
  let title = JSONQuery('[items].title', { data: searchResult }).value;
  let type = JSONQuery('[items].object_type', { data: searchResult }).value;
  let release = JSONQuery('[items].original_release_year', { data: searchResult }).value;
  let short_description = JSONQuery('[items].short_description', { data: searchResult }).value;

  let results = [];
  for (i = 0; (i < PAGE_SIZE); i++) {
    let item = {
      id: id[i],
      title: title[i],
      release: release[i],
      type: type[i],
      description: short_description[i],
    }

    // get the offersList
    let offersList = JSONQuery(`[items][id=${id[i]}].offers`, { data: searchResult }).value;

    // if offersList is not undefined, get the type of service, id of provider, type of presentation, price and currency
    if (typeof offersList != undefined) {
      let monetization_type = JSONQuery(`.monetization_type`, { data: offersList }).value;
      let provider_id = JSONQuery(`.provider_id`, { data: offersList }).value;
      let presentation_type = JSONQuery(`.presentation_type`, { data: offersList }).value;
      let retail_price = JSONQuery(`.retail_price`, { data: offersList }).value;
      let currency = JSONQuery(`.currency`, { data: offersList }).value;
      let offers = []

      for (j = 0; (j < offersList.length); j++) {
        let indOffer = {
          provider_id: provider_id[j],
          monetization_type: monetization_type[j],
          presentation_type: presentation_type[j],
          retail_price: retail_price[j],
          currency: currency[j]
        }
        offers.push(indOffer);
      }

      item.offers = offers;

      results.push(item)
      // console.log(`[INFO] results: ${JSON.stringify(results, null, 4)}`)
    }
  }
  return results;
}

function getNextResults(handlerInput) {
  return new Promise((resolve, reject) => {
    const { attributesManager, requestEnvelope, responseBuilder } = handlerInput;
    attributesManager.getPersistentAttributes()
      .then(async (pAttributes) => {

        const locale = pAttributes.locale;

        if (typeof locale === undefined) {
          locale = requestEnvelope.request.replace('-', '_');
          pAttributes.locale = locale;;
        }

        resolve(getDetails(handlerInput));
      })
      .catch((error) => {
        console.log(`[ERROR] Error: ${error}`);
        reject(error_)
      })
  })
}

async function getDetails(handlerInput) {
  return new Promise((resolve, reject) => {
    const { attributesManager, requestEnvelope, responseBuilder } = handlerInput;
    attributesManager.getPersistentAttributes()
      .then(async (pAttributes) => {
        let speechText = '';
        const sAttributes = attributesManager.getSessionAttributes();

        // set the locale for search
        let locale = pAttributes.locale;

        // if locale has not been set, get it from request envelope
        if (typeof locale === undefined) {
          locale = requestEnvelope.request.locale.replace('-', '_');
          pAttributes.locale = locale;
        }

        const itemToRead = sAttributes.nextRead;
        console.log(`[INFO] itemToRead: ${itemToRead}`);

        const id = sAttributes.results[itemToRead].id;
        const type = sAttributes.results[itemToRead].type;

        let jw = new JustWatch({
          locale: locale
        });

        let providers = await jw.getProviders();
        // console.log(`[INFO] providers: ${JSON.stringify(providers, null, 4)}`)

        let searchResult = await jw.getTitle(type, id);
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

        resolve(responseBuilder
          .speak(speechText)
          .getResponse());
      })
      .catch((error) => {
        console.log(`[ERROR] Error: ${error}`);
        reject(error);
      });
  })
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
    if (history.length > maxHistorySize - 1) {
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
    AMAZON_MoreIntent_Handler,
    AMAZON_NavigateSettingsIntent_Handler,
    AMAZON_NextIntent_Handler,
    AMAZON_NoIntent_Handler,
    AMAZON_YesIntent_Handler,
    AMAZON_PageDownIntent_Handler,
    AMAZON_NavigateHomeIntent_Handler,
    AMAZON_PageUpIntent_Handler,
    AMAZON_PreviousIntent_Handler,
    AMAZON_RepeatIntent_Handler,
    AMAZON_ScrollDownIntent_Handler,
    AMAZON_ScrollLeftIntent_Handler,
    AMAZON_ScrollRightIntent_Handler,
    AMAZON_ScrollUpIntent_Handler,
    AMAZON_StopIntent_Handler,
    SearchIntent_Handler,
    MoreIntent_Handler,
    LaunchRequest_Handler,
    SessionEndedHandler
  )
  .addErrorHandlers(ErrorHandler)
  .withPersistenceAdapter(persistenceAdapter)
  .addRequestInterceptors(InitMemoryAttributesInterceptor)
  .addRequestInterceptors(RequestHistoryInterceptor)
  .addResponseInterceptors(function (handlerInput, response) {
    let type = handlerInput.requestEnvelope.request.type;
    let locale = handlerInput.requestEnvelope.request.locale;
    if (type === 'LaunchRequest' || type === 'SessionEndedRequest') {
      console.log(`[INFO] ${type} (${locale})`);
    } else {
      console.log(`[INFO] ${handlerInput.requestEnvelope.request.intent.name} (${locale})`);
    }
    console.log("\n" + "********** REQUEST ENVELOPE *********\n" +
      JSON.stringify(handlerInput, null, 4));
    console.log("\n" + "************* RESPONSE **************\n" +
      JSON.stringify(response, null, 4));
  })

  // .addResponseInterceptors(ResponseRecordSpeechOutputInterceptor)

  // .addRequestInterceptors(RequestPersistenceInterceptor)
  // .addResponseInterceptors(ResponsePersistenceInterceptor)

  // .withTableName("askMemorySkillTable")
  // .withAutoCreateTable(true)

  .lambda();


// End of Skill code -------------------------------------------------------------
// Static Language Model for reference

const model = {
  "interactionModel": {
    "languageModel": {
      "invocationName": "just stream",
      "intents": [
        {
          "name": "AMAZON.CancelIntent",
          "samples": []
        },
        {
          "name": "AMAZON.HelpIntent",
          "samples": []
        },
        {
          "name": "AMAZON.MoreIntent",
          "samples": []
        },
        {
          "name": "AMAZON.NavigateSettingsIntent",
          "samples": []
        },
        {
          "name": "AMAZON.NextIntent",
          "samples": []
        },
        {
          "name": "AMAZON.NoIntent",
          "samples": []
        },
        {
          "name": "AMAZON.YesIntent",
          "samples": []
        },
        {
          "name": "AMAZON.PageDownIntent",
          "samples": []
        },
        {
          "name": "AMAZON.NavigateHomeIntent",
          "samples": []
        },
        {
          "name": "AMAZON.PageUpIntent",
          "samples": []
        },
        {
          "name": "AMAZON.PreviousIntent",
          "samples": []
        },
        {
          "name": "AMAZON.RepeatIntent",
          "samples": []
        },
        {
          "name": "AMAZON.ScrollDownIntent",
          "samples": []
        },
        {
          "name": "AMAZON.ScrollLeftIntent",
          "samples": []
        },
        {
          "name": "AMAZON.ScrollRightIntent",
          "samples": []
        },
        {
          "name": "AMAZON.ScrollUpIntent",
          "samples": []
        },
        {
          "name": "AMAZON.StopIntent",
          "samples": []
        },
        {
          "name": "TellMeProvidersIntent",
          "samples": [
            "tell me what providers are available",
            "tell me which providers are available",
            "tell me what other providers are available",
            "tell me which other providers are available",
            "what providers are available",
            "which providers are available",
            "what other providers are available",
            "which other providers are available"
          ]
        },
        {
          "name": "AddProvidersIntent",
          "samples": [
            "add {providerA}",
            "add {providerA} to my favourites",
            "add {providerA} to my favourites list",
            "add {providerA} and {providerB}",
            "add {providerA} and {providerB} to my favourites",
            "add {providerA} and {providerB} to my favourites list",
            "add {providerA} {providerB} and {providerC}",
            "add {providerA} {providerB} and {providerC} to my favourites",
            "add {providerA} {providerB} and {providerC} to my favourites list"
          ],
          "slots": [
            {
              "name": "providerA",
              "type": "ProviderSlotType"
            },
            {
              "name": "providerB",
              "type": "ProviderSlotType"
            },
            {
              "name": "providerC",
              "type": "ProviderSlotType"
            }
          ]
        },
        {
          "name": "SearchIntent",
          "samples": [
            "search for {title}"
          ],
          "slots": [
            {
              "name": "title",
              "type": "AMAZON.SearchQuery"
            }
          ]
        },
        {
          "name": "LaunchRequest"
        }
      ],
      "types": [
        {
          "name": "ProviderSlotType",
          "values": [
            {
              "id": "nfx",
              "name": {
                "value": "Netflix"
              }
            },
            {
              "id": "ntv",
              "name": {
                "value": "Now TV"
              }
            },
            {
              "id": "amp",
              "name": {
                "value": "Amazon Prime Video",
                "synonyms": [
                  "Amazon Prime",
                  "Prime",
                  "Prime Video"
                ]
              }
            },
            {
              "id": "amz",
              "name": {
                "value": "Amazon Video"
              }
            },
            {
              "id": "al4",
              "name": {
                "value": "All 4"
              }
            },
            {
              "id": "skg",
              "name": {
                "value": "Sky Go"
              }
            },
            {
              "id": "bbc",
              "name": {
                "value": "BBC iPlayer",
                "synonyms": [
                  "BBC",
                  "iplayer"
                ]
              }
            },
            {
              "id": "hay",
              "name": {
                "value": "hayu"
              }
            },
            {
              "id": "bfi",
              "name": {
                "value": "BFI Player",
                "synonyms": [
                  "BFI"
                ]
              }
            },
            {
              "id": "ply",
              "name": {
                "value": "Google Play Movies",
                "synonyms": [
                  "Google",
                  "Google Play"
                ]
              }
            },
            {
              "id": "itu",
              "name": {
                "value": "Apple iTunes",
                "synonyms": [
                  "iTunes",
                  "Apple",
                  "Apple TV"
                ]
              }
            },
            {
              "id": "sks",
              "name": {
                "value": "Sky Store"
              }
            },
            {
              "id": "fsk",
              "name": {
                "value": "FilmStruck"
              }
            },
            {
              "id": "ast",
              "name": {
                "value": "Starz Play Amazon Channel",
                "synonyms": [
                  "Starz",
                  "Starz Play"
                ]
              }
            },
            {
              "id": "ukt",
              "name": {
                "value": "UKTV Play",
                "synonyms": [
                  "UKTV"
                ]
              }
            },
            {
              "id": "itv",
              "name": {
                "value": "ITV Player",
                "synonyms": [
                  "ITV"
                ]
              }
            },
            {
              "id": "dli",
              "name": {
                "value": "DisneyLife",
                "synonyms": [
                  "Disney"
                ]
              }
            },
            {
              "id": "shd",
              "name": {
                "value": "Shudder"
              }
            },
            {
              "id": "ttv",
              "name": {
                "value": "Talk Talk TV",
                "synonyms": [
                  "Talk Talk",
                  "Talk"
                ]
              }
            },
            {
              "id": "wki",
              "name": {
                "value": "Rakuten TV",
                "synonyms": [
                  "Rakuten"
                ]
              }
            },
            {
              "id": "pfx",
              "name": {
                "value": "Pantaflix"
              }
            },
            {
              "id": "yot",
              "name": {
                "value": "YouTube"
              }
            },
            {
              "id": "pls",
              "name": {
                "value": "PlayStation",
                "synonyms": [
                  "PS"
                ]
              }
            },
            {
              "id": "msf",
              "name": {
                "value": "Microsoft Store",
                "synonyms": [
                  "Microsoft"
                ]
              }
            },
            {
              "id": "chi",
              "name": {
                "value": "Chili"
              }
            },
            {
              "id": "mbi",
              "name": {
                "value": "Mubi"
              }
            },
            {
              "id": "tbv",
              "name": {
                "value": "Tubi TV",
                "synonyms": [
                  "Tubi"
                ]
              }
            },
            {
              "id": "gdc",
              "name": {
                "value": "GuideDoc"
              }
            },
            {
              "id": "mts",
              "name": {
                "value": "Movietickets"
              }
            },
            {
              "id": "nfk",
              "name": {
                "value": "Netflix Kids"
              }
            },
            {
              "id": "ytr",
              "name": {
                "value": "YouTube Premium"
              }
            }
          ]
        }
      ]
    }
  }
};
