import { santizedFormDataWithContext } from '../../common/formutils.js';
import * as CONSTANT from './constant.js';
import { ENDPOINTS } from '../../common/constants.js';
import { fetchJsonResponse } from '../../common/makeRestAPI.js';

/* temproraily added this journey utils for SEMI , journey utils common file has to be changed to generic */
const CHANNEL = 'ADOBE_WEBFORMS';
const isNodeEnv = typeof process !== 'undefined' && process.versions && process.versions.node;

const {
  CURRENT_FORM_CONTEXT: currentFormContext,
} = CONSTANT;

const BASEURL = "https://applyonline.hdfcbank.com";
const urlPath = (path) => `${BASEURL}${path}`;

/**
 * For Web returing currentFormContext as defined in variable
 * Ideally every custom function should be pure function, i.e it should not have any side effect
 * As per current implementation `currentFormContext` is a state outside of the function,
 * so for Flow we have did special handling by storing strigified value in `globals.form.runtime.currentFormContext`
 *
 * @param {scope} globals
 * @returns
 */
const getCurrentFormContext = (globals) => {
  if (isNodeEnv) {
    return JSON.parse(globals.form.runtime.currentFormContext.$value || '{}');
  }
  return currentFormContext;
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
        channel: CHANNEL,
        journeyName: globals.form.runtime.journeyName.$value,
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
  const formContext = getCurrentFormContext(globals);
  if (state === 'CUSTOMER_ONBOARDING_COMPLETE') {
    formContext.LoanReferenceNumber = journeyId?.loanNbr;
  }
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
        journeyName: globals.form.runtime.journeyName.$value,
        journeyID: globals.form.runtime.journeyId.$value,
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

export {
  invokeJourneyDropOff,
  invokeJourneyDropOffUpdate,
};
