require("ask-sdk-model");
const express = require('express');
const { ExpressAdapter } = require('ask-sdk-express-adapter');
const Alexa = require('ask-sdk-core');

const app = express();
// const skillBuilder = Alexa.SkillBuilders.custom();
// const skill = skillBuilder.create();


const APP_NAME = "credit one";
const messages = {
  NOTIFY_MISSING_PERMISSIONS: 'Please enable profile permissions in the Amazon Alexa app.',
  ERROR: 'Uh Oh. Looks like something went wrong.'
};

const FULL_NAME_PERMISSION = "alexa::profile:name:read";
const EMAIL_PERMISSION = "alexa::profile:email:read";
const MOBILE_PERMISSION = "alexa::profile:mobile_number:read";

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speakOutput = 'Welcome to CreditOne, please tell your phone number to get a link to PPQ.';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const getRemoteData = function (url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? require('https') : require('http');
    const request = client.get(url, (response) => {
      if (response.statusCode < 200 || response.statusCode > 299) {
        reject(new Error('Failed with status code: ' + response.statusCode));
      }
      const body = [];
      response.on('data', (chunk) => body.push(chunk));
      response.on('end', () => resolve(body.join('')));
    });
    request.on('error', (err) => reject(err))
  })
};

const HelloWorldIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'HelloWorldIntent';
    },
    async handle(handlerInput) {
        
        const phoneNo = handlerInput.requestEnvelope.request.intent.slots.phoneNo.value;
        
        const speakOutput = `Thank you, we have send an SMS to your contact number ${phoneNo}. 
        Please visit our website to check your eligibility for credit card.`;
        
        // Backend API call start 
        
        // await getRemoteData('http://api.open-notify.org/astros.json')
        //   .then((response) => {
        //     const data = JSON.parse(response);
        //     console.log("response", data);
        //   })
        //   .catch((err) => {
        //     //set an optional error message here
        //     //outputSpeech = err.message;
        //   });
        
        // Backend API call end
        
        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
      
        // const { requestEnvelope, serviceClientFactory, responseBuilder } = handlerInput;
    // try {
    //   const upsServiceClient = serviceClientFactory.getUpsServiceClient();
    //   const profileName = await upsServiceClient.getProfileName();
    //   const profileName = await upsServiceClient.getProfileEmail();
    //   const profileNameObject = await upsServiceClient.getProfileMobileNumber();
    //   const profileName = profileNameObject.phoneNumber;
    //   const speechResponse = `Your name is, ${profileName}`;
      
    //   const { deviceId } = requestEnvelope.context.System.device;
    //   const deviceAddressServiceClient = serviceClientFactory.getDeviceAddressServiceClient();
    //   const address = await deviceAddressServiceClient.getFullAddress(deviceId);
    //   let speechResponse;
    //   console.log("address", address);
    //   const completeAddress = `${address.addressLine1}, ${address.stateOrRegion}, ${address.postalCode}`;
    //   speechResponse = `Your complete address is, ${completeAddress}`;
      
    //   return responseBuilder
    //                   .speak(speechResponse)
    //                   .withSimpleCard(APP_NAME, speechResponse)
    //                   .getResponse();
    // } catch (error) {
    //   console.log(JSON.stringify(error));
    //   if (error.statusCode === 403) {
    //     return responseBuilder
    //     .speak(messages.NOTIFY_MISSING_PERMISSIONS)
    //     .withAskForPermissionsConsentCard([FULL_NAME_PERMISSION])
    //     .getResponse();
    //   }
    //   console.log(JSON.stringify(error));
    //   const response = responseBuilder.speak(messages.ERROR).getResponse();
    //   return response;
    // }
    }
};
const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'You can say your phone number to me! How can I help?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Goodbye!';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse();
    }
};

// The intent reflector is used for interaction model testing and debugging.
// It will simply repeat the intent the user said. You can create custom handlers
// for your intents by defining them above, then also adding them to the request
// handler chain below.
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`~~~~ Error handled: ${error.stack}`);
        const speakOutput = `Sorry, I had trouble doing what you asked. Please try again.`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};


  let skill;

   skill = Alexa.SkillBuilders.custom()
      .addRequestHandlers(
        LaunchRequestHandler,
        HelloWorldIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
      )
      .addErrorHandlers(ErrorHandler)
      .create();

const adapter = new ExpressAdapter(skill, true, true);

app.post('/', adapter.getRequestHandlers());
app.listen(443);

