/* eslint no-bitwise: ["error", { "allow": ["^", ">>", "&"] }] */

import {
  santizedFormDataWithContext,
  urlPath,
  generateUUID,
} from './formutils.js';
import { fetchJsonResponse } from './makeRestAPI.js';

import * as CONSTANT from './constants.js';
import * as CC_CONSTANT from '../creditcards/corporate-creditcard/constant.js';

const { ENDPOINTS, CHANNEL } = CONSTANT;
const { JOURNEY_NAME } = CC_CONSTANT;
const journeyNameConstant = JOURNEY_NAME;
const channelConstant = CHANNEL;

/**
 * generates the journeyId
 * @param {string} visitMode - The visit mode (e.g., "online", "offline").
 * @param {string} journeyAbbreviation - The abbreviation for the journey.
 * @param {string} channel - The channel through which the journey is initiated.
 * @param {object} globals
 */
function createJourneyId(visitMode, journeyAbbreviation, channel, globals) {
  const dynamicUUID = generateUUID();
  // var dispInstance = getDispatcherInstance();
  const journeyId = `${dynamicUUID}_01_${journeyAbbreviation}_${visitMode}_${channel}`;
  globals.functions.setProperty(globals.form.runtime.journeyId, { value: journeyId });
}

const corpCreditCardContext = {
  currentFormContext: {},
};
const formRuntime = {};

const getCurrentContext = () => corpCreditCardContext.currentFormContext;

const setCurrentContext = (formContext) => {
  this.corpCreditCardContext.currentFormContext = formContext;
  if (!this.corpCreditCardContext.currentFormContext.isSet) {
    this.corpCreditCardContext.currentFormContext.isSet = true;
  }
};

/**
 * @name invokeJourneyDropOff to log on success and error call backs of api calls
 * @param {state} state
 * @param {string} mobileNumber
 * @param {Object} globals - globals variables object containing form configurations.
 * @return {PROMISE}
 */
const invokeJourneyDropOff = async (state, mobileNumber, globals) => {
  const journeyJSONObj = {
    RequestPayload: {
      userAgent: (typeof window !== 'undefined') ? window.navigator.userAgent : 'onLoad',
      leadProfile: {
        mobileNumber,
      },
      formData: {
        channel: channelConstant,
        journeyName: journeyNameConstant,
        journeyID: globals.form.runtime.journeyId.$value,
        journeyStateInfo: [
          {
            state,
            stateInfo: JSON.stringify(santizedFormDataWithContext(globals)),
            timeinfo: new Date().toISOString(),
          },
        ],
      },
    },
  };
  const url = urlPath(ENDPOINTS.journeyDropOff);
  const method = 'POST';
  return fetchJsonResponse(url, journeyJSONObj, method);
};

/**
 * @name invokeJourneyDropOffUpdate
 * @param {string} state
 * @param {string} mobileNumber
 * @param {string} leadProfileId
 * @param {string} journeyId
 * @param {Object} globals - globals variables object containing form configurations.
 * @return {PROMISE}
 */
const invokeJourneyDropOffUpdate = async (state, mobileNumber, leadProfileId, journeyId, globals) => {
  const { currentFormContext } = corpCreditCardContext;
  const sanitizedFormData = santizedFormDataWithContext(globals, currentFormContext);
  const journeyJSONObj = {
    RequestPayload: {
      userAgent: (typeof window !== 'undefined') ? window.navigator.userAgent : '',
      leadProfile: {
        mobileNumber,
        leadProfileId: leadProfileId.toString(),
      },
      formData: {
        channel: channelConstant,
        journeyName: journeyNameConstant,
        journeyID: journeyId,
        journeyStateInfo: [
          {
            state,
            stateInfo: JSON.stringify(sanitizedFormData),
            timeinfo: new Date().toISOString(),
          },
        ],
      },
    },
  };
  // sendSubmitClickEvent(mobileNumber, linkName, sanitizedFormData);
  const url = urlPath(ENDPOINTS.journeyDropOffUpdate);
  const method = 'POST';
  return fetchJsonResponse(url, journeyJSONObj, method);
};

/**
 * @name printPayload
 * @param {string} payload.
 * @param {object} formContext.
 * @returns {object} currentFormContext.
 */
function journeyResponseHandlerUtil(payload, formContext) {
  formContext.leadProfile = {};
  formContext.leadProfile.leadProfileId = String(payload);
  return formContext;
}

/**
* @name invokeJourneyDropOffByParam
* @param {string} mobileNumber
* @param {string} leadProfileId
* @param {string} journeyId
* @return {PROMISE}
*/
const invokeJourneyDropOffByParam = async (mobileNumber, leadProfileId, journeyID) => {
  const journeyJSONObj = {
    RequestPayload: {
      leadProfile: {
        mobileNumber,
      },
      journeyInfo: {
        journeyID,
      },
    },
  };
  const url = urlPath(ENDPOINTS.journeyDropOffParam);
  const method = 'POST';
  return fetchJsonResponse(url, journeyJSONObj, method);
};

export {
  invokeJourneyDropOff,
  invokeJourneyDropOffByParam,
  invokeJourneyDropOffUpdate,
  journeyResponseHandlerUtil,
  corpCreditCardContext,
  getCurrentContext,
  setCurrentContext,
  createJourneyId,
  formRuntime,
};
