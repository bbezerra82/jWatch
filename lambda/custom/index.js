// Lambda Function code for Alexa.
// Paste this into your index.js file. 

const Alexa = require("ask-sdk-core");
const JustWatch = require("justwatch-api");
const JSONQuery = require("json-query");

// set up for persistance
const { DynamoDbPersistenceAdapter } = require('ask-sdk-dynamodb-persistence-adapter');
const persistenceAdapter = new DynamoDbPersistenceAdapter({
  tableName: 'Where2Watch',
  createTable: true
});

const skillName = "where to watch";


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
    const request = handlerInput.requestEnvelope.request;
    const responseBuilder = handlerInput.responseBuilder;
    let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

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

const SearchIntent_Handler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'SearchIntent';
  },
  async handle(handlerInput) {
    const { requestEnvelope, responseBuilder, attributesManager } = handlerInput;
    const request = requestEnvelope.request;

    let locale = request.locale.replace('-', '_');
    console.log(`[INFO] locale: ${locale}`);

    let jw = new JustWatch({
      locale: locale
    });

    let sessionAttributes = attributesManager.getSessionAttributes();


    let slotValues = getSlotValues(request.intent.slots);
    let titleSlot = slotValues.title.heardAs;


    let searchResult = await jw.search({
      query: titleSlot
    });

    let top5 = [];

    for (i = 0; i < PAGE_SIZE; i++) {
      top5.push({
        id: searchResult.items[i].id,
        title: searchResult.items[i].title,
        original_release_year: searchResult.items[i].original_release_year,
        short_description: searchResult.items[i].short_description
      })
    }
    sessionAttributes.top5 = top5;
    sessionAttributes.page = 1;

    let topResult = searchResult.items[0];

    attributesManager.setSessionAttributes(sessionAttributes);

    let say = `Here is the top result for ${titleSlot}: `;
    say += `${topResult.title} from ${topResult.original_release_year}: ${topResult.short_description} `
    reprompt = `Do you want to check where you can watch ${topResult.title}, hear more information about this title or check the other results?`;

    say += reprompt;

    return responseBuilder
      .speak(say)
      .reprompt(reprompt)
      .getResponse();
  },
};

const MoreIntent_Handler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'MoreIntent';
  },
  handle(handlerInput) {

  }
}

const DescriptionIntent_Handler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'DescriptionIntent';
  },
  handle(handlerInput) {
    const { responseBuilder, attributesManager } = handlerInput;

    let sessionAttributes = attributesManager.getSessionAttributes();

    let description = sessionAttributes.topResult.short_description;

    console.log(`[INFO] description: ${description}.`);

    return responseBuilder
      .speak(description)
      .getResponse();
  }
}

const LaunchRequest_Handler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    return startSkill(handlerInput);
  },
};

const ADJECTIVES = [
  'goto',
  'best',
  'amazing',
  'awesome',
  'distinctive',
]

function startSkill(handlerInput) {
  return new Promise((resolve, reject) => {
    handlerInput.attributesManager.getPersistentAttributes()
      .then((pAttributes) => {
        const { responseBuilder, attributesManager, requestEnvelope } = handlerInput;

        let sAttributes = attributesManager.getSessionAttributes();

        let locale = sAttributes.locale;

        if (typeof locale === 'undefined') {
          locale = requestEnvelope.request.locale.replace('-', '_');
          sAttributes.locale = locale;
        }

        const { favouritesProviders } = pAttributes;

        sAttributes.skillState = 'mainMenu';

        let speechText = `Welcome to ${skillName}, your ${randomElement(ADJECTIVES)} skill to check where to stream movies and TV shows. `;
        let reprompt = '';
        let favourites = '';

        if (typeof favouritesProviders === 'undefined') {
          // favourites providers not set
          speechText += `It looks like you haven't set your favourite providers yet. You can do so by saying add, followed by the name of up to three providers. Or `
          favourites += `Or tell me which providers to add to your favourites list.`
          // reprompt += `Do you want to set your favourites providers now?`
        }

        speechText += `just ask me to search for a movie or TV show.`;
        reprompt += `What movie or TV show do you want to watch? ${favourites}`

        attributesManager.setSessionAttributes(sAttributes);

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

const AMAZON_YesIntent_Handler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.YesIntent';
  },
  handle(handlerInput) {

    const { responseBuilder, attributesManager } = handlerInput;

    let sAttributes = attributesManager.getSessionAttributes();

    let { skillState } = sAttributes;

    if (skillState === 'mainMenu') {
      return askFavourites(handlerInput);
    } else if (skillState === 'readingProviders') {
      const { attributesManager } = handlerInput;
      const { providersList, page } = attributesManager.getSessionAttributes();
      return readPage(handlerInput, providersList, page);
    } else if (skillState === 'doneReadingProviders') {
      return whichProviders(handlerInput);
      return responseBuilder
        .speak('done for the day')
        .withShouldEndSession(true)
        .getResponse();
    }
  },
};

const AddProvidersIntent_Handler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'AddProvidersIntent';
  },
  handle(handlerInput) {
    const { attributesManager } = handlerInput;

    let sAttributes = attributesManager.getSessionAttributes();

    sAttributes.skillState = 'addingFavs';

    attributesManager.setSessionAttributes(sAttributes);

    return addProviders(handlerInput);
  },
};

function addProviders(handlerInput) {
  return new Promise((resolve, reject) => {
    const { responseBuilder, attributesManager, requestEnvelope } = handlerInput;
    attributesManager.getPersistentAttributes()
      .then((pAttributes) => {
        const request = requestEnvelope.request;
        let speechText = '';

        // getSlotValues returns .heardAs, .resolved, and .isValidated for each slot, according to request slot status codes ER_SUCCESS_MATCH, ER_SUCCESS_NO_MATCH, or traditional simple request slot without resolutions
        let slotValues = getSlotValues(request.intent.slots);

        let { favourites } = pAttributes;

        if (typeof favourites === 'undefined') {
          pAttributes.favourites = {
            'providers': []
          };
          favourites = pAttributes.favourites;
        }

        let providers = JSONQuery('[*][resolved]',
          {
            data: slotValues
          }).value;


        for (i = 0; (i < providers.length) && (providers[i] !== ''); i++) {
          favourites.providers.push(providers[i]);
        }

        for (j = 0; j < favourites.providers.length; j++) {
          speechText += `${providers[j]}`;
          if ((j === favourites.providers.length - 2) && (favourites.providers.length > 1)) {
            speechText += ' and ';
          } else if ((j !== favourites.providers.length - 1) && (favourites.providers.length > 1)) {
            speechText += ', ';
          }
        }

        speechText += ' added. Do you want to hear which other providers I can check or do you want to search for something to watch?';


        attributesManager.setPersistentAttributes(pAttributes);
        attributesManager.savePersistentAttributes();

        resolve(responseBuilder
          .speak(speechText)
          .getResponse());
      })
      .catch((error) => {
        console.log(`[ERROR] Error: ${error}`);
        reject(error);
      });
  });
}

function whichProviders(handlerInput) {
  const { responseBuilder } = handlerInput;

  let speech = `Which providers do you want to add?`;
  let reprompt = `Tell me which providers I should add to your favourites list.`;

  return responseBuilder
    .speak(speech)
    .reprompt(reprompt)
    .getResponse();
}

function askFavourites(handlerInput) {
  const { responseBuilder, attributesManager } = handlerInput;

  let sAttributes = attributesManager.getSessionAttributes();

  sAttributes.skillState = 'askFavourites';

  let speechText = `Do you want to hear the providers available or do you already know your favourite ones?`;
  let reprompt = `Should I tell you the available ones or do you konw already?`;

  return responseBuilder
    .speak(speechText)
    .reprompt(reprompt)
    .getResponse();
}

const TellMeProvidersIntent_Handler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'TellMeProvidersIntent';
  },
  handle(handlerInput) {
    return listProviders(handlerInput);
  },
};

function listProviders(handlerInput) {
  return new Promise((resolve, reject) => {
    const { responseBuilder, attributesManager, requestEnvelope } = handlerInput;
    attributesManager.getPersistentAttributes()
      // due to the 'await' further down, this arrow function must be async
      .then(async (pAttributes) => {
        const { favourites } = pAttributes;
        let providers = [];

        // If there are providers saved, then pass them to the providers array, otherwise it stays empty
        if ((typeof favourites !== 'undefined') && (typeof favourites.providers !== 'undefined')) {
           providers = favourites.providers;
        } 

        let sAttributes = attributesManager.getSessionAttributes();

        let locale = sAttributes.locale;
        let page = sAttributes.page;

        if (typeof local === 'undefined') {
          locale = requestEnvelope.request.locale.replace('-', '_');
          sAttributes.locale = locale;
        }

        if (typeof page === 'undefined') {
          page = 0;
          sAttributes.page = page;
        }

        let jw = new JustWatch({
          locale: locale
        });

        let providersList = JSONQuery('clear_name', {
          data: await jw.getProviders({})
        }).value;

        // checks if the favourite providers stored are also contained in the array collected by jw. If true, removes from the set.
        for (i = 0; i < providers.length; i++) {
          if (providersList.includes(providers[i])) {
            providersList.splice(providersList.indexOf(providers[i]), 1)
          }
        }

        sAttributes.skillState = 'readingProviders';
        sAttributes.providersList = providersList;

        attributesManager.setSessionAttributes(sAttributes);

        resolve(readPage(handlerInput, providersList, page));
      })
      .catch((error) => {
        console.log(`[ERROR] Error: ${error}`);
        reject(error);
      });
  });
}

function readPage(handlerInput, toRead, page) {
  const { responseBuilder, attributesManager } = handlerInput;

  let sAttributes = attributesManager.getSessionAttributes();

  let speech = '';
  let reprompt = '';

  for (i = page * PAGE_SIZE; (i < (page + 1) * PAGE_SIZE) && (i < toRead.length); i++) {
    // console.log(`[INFO] readPage i = ${i}`);
    if (i === toRead.length - 1) {
      speech += `and lastly, ${toRead[i]}. `
    } else if (i !== ((page + 1) * PAGE_SIZE) - 1) {
      speech += `${toRead[i]}, `;
    } else {
      speech += `and ${toRead[i]}. `
    }
  }
  // console.log(`[INFO] i = ${i}`);

  if (i === toRead.length) {
    if (sAttributes.skillState === 'readingProviders') {
      reprompt += 'Do you want to add your favourites now?';
      speech += `That was the last provider in my list. ${reprompt}`;
      sAttributes.skillState = 'doneReadingProviders';
      page = 0;
      sAttributes.page = page;
    }
  } else {
    reprompt = 'Do you want to hear more?';
    speech += reprompt;
    page++;
    sAttributes.page = page;
  }


  attributesManager.setSessionAttributes(sAttributes);

  return responseBuilder
    .speak(speech)
    .reprompt(reprompt)
    .getResponse();
}

const AMAZON_NoIntent_Handler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.NoIntent';
  },
  handle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    const responseBuilder = handlerInput.responseBuilder;
    let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    let say = 'You said No. ';
    let previousIntent = getPreviousIntent(sessionAttributes);

    if (previousIntent && !handlerInput.requestEnvelope.session.new) {
      say += 'Your last intent was ' + previousIntent + '. ';
    }

    return responseBuilder
      .speak(say)
      .reprompt('try again, ' + say)
      .getResponse();
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
    // console.log(`Original Request was: ${JSON.stringify(request, null, 2)}`);

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
    // SearchIntent_Handler,
    // DescriptionIntent_Handler,
    LaunchRequest_Handler,
    TellMeProvidersIntent_Handler,
    AddProvidersIntent_Handler,
    SessionEndedHandler
  )
  .addErrorHandlers(ErrorHandler)
  .withPersistenceAdapter(persistenceAdapter)
  .addResponseInterceptors(function (handlerInput, response) {
    let type = handlerInput.requestEnvelope.request.type;
    let locale = handlerInput.requestEnvelope.request.locale;
    if (type === 'LaunchRequest' || type === 'SessionEndedRequest') {
      console.log('[INFO] ' + type + ' (' + locale + ')');
    } else {
      console.log('[INFO] ' + handlerInput.requestEnvelope.request.intent.name + ' (' + locale + ')');
    }
    console.log("\n" + "********** REQUEST ENVELOPE *********\n" + JSON.stringify(handlerInput, null, 4));
    console.log("\n" + "************* RESPONSE **************\n" + JSON.stringify(response, null, 4));
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
      "invocationName": "where to watch",
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
      ]
    }
  }
};
