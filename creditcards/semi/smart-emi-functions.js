import { fetchJsonResponse } from '../../common/makeRestAPI.js';
import * as SEMI_CONSTANT from './constant.js';
import {
  createJourneyId,
} from '../../common/journey-utils.js';

const { CURRENT_FORM_CONTEXT: currentFormContext, JOURNEY_NAME: journeyName, CHANNEL: channelSource } = SEMI_CONSTANT;
/**
 * generates the otp
 * @param {string} mobileNumber
 * @param {string} cardDigits
 * @param {object} globals
 * @return {PROMISE}
 */
// eslint-disable-next-line no-unused-vars
function getOTPV1(mobileNumber, cardDigits, globals) {
  const journeyID = createJourneyId('online', journeyName, channelSource, globals);
  currentFormContext.journeyID = globals.form.runtime.journeyId.$value || journeyID;
  currentFormContext.journeyName = SEMI_CONSTANT.JOURNEY_NAME;
  const jsonObj = {
    requestString: {
      mobileNumber,
      cardDigits,
      journeyID: currentFormContext.journeyID,
      journeyName: currentFormContext.journeyName,
      userAgent: window.navigator.userAgent,
    },
    userAgent: window.navigator.userAgent,
  };
  const path = SEMI_CONSTANT.SEMI_ENDPOINTS.otpGen;
  return fetchJsonResponse(path, jsonObj, 'POST', true);
}

export {
  // eslint-disable-next-line import/prefer-default-export
  getOTPV1,
};
