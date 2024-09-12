import { CHANNEL, ENDPOINTS } from '../../common/constants.js';
import { santizedFormDataWithContext, urlPath } from '../../common/formutils.js';
import createJourneyId from '../../common/journey-utils.js';
import { fetchJsonResponse } from '../../common/makeRestAPI.js';
/**
   * @name invokeJourneyDropOff to log on success and error call backs of api calls
   * @param {state} state
   * @param {string} mobileNumber
   * @param {string} journeyName
   * @param {Object} globals - globals variables object containing form configurations.
   * @return {PROMISE}
   */
const invokeJourneyDropOff = async (state, mobileNumber, journeyName, globals) => {
  const journeyJSONObj = {
    RequestPayload: {
      userAgent: (typeof window !== 'undefined') ? window.navigator.userAgent : 'onLoad',
      leadProfile: {
        mobileNumber,
      },
      formData: {
        channel: CHANNEL,
        journeyName,
        journeyID: globals.form.runtime.journeyId.$value || createJourneyId('online', journeyName, CHANNEL, globals),
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
  const module = await import('../../common/constants.js');
  const currentFormContext = module.CURRENT_FORM_CONTEXT;
  const sanitizedFormData = santizedFormDataWithContext(globals, currentFormContext);
  const journeyJSONObj = {
    RequestPayload: {
      userAgent: (typeof window !== 'undefined') ? window.navigator.userAgent : '',
      leadProfile: {
        mobileNumber,
        leadProfileId: leadProfileId?.toString(),
      },
      formData: {
        channel: CHANNEL,
        journeyName: currentFormContext.journeyName,
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
  invokeJourneyDropOffUpdate,
  journeyResponseHandlerUtil,
  invokeJourneyDropOffByParam,
};
