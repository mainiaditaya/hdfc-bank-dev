import { fetchJsonResponse, displayLoader } from '../../common/makeRestAPI.js';
import * as SEMI_CONSTANT from './constant.js';
import {
  createJourneyId,
} from '../../common/journey-utils.js';

const {
  CURRENT_FORM_CONTEXT: currentFormContext,
  JOURNEY_NAME: journeyName,
  CHANNEL: channelSource,
  FORM_RUNTIME: formRuntime,
  SEMI_ENDPOINTS: semiEndpoints,
  PRO_CODE,
} = SEMI_CONSTANT;

// Initialize all Fd Card Journey Context Variables & formRuntime variables.
currentFormContext.journeyName = journeyName;
formRuntime.getOtpLoader = displayLoader;
formRuntime.otpValLoader = displayLoader;

/**
 * generates the otp
 * @param {string} mobileNumber
 * @param {string} cardDigits
 * @param {object} globals
 * @return {PROMISE}
 */
function getOTPV1(mobileNumber, cardDigits, globals) {
  const journeyID = createJourneyId('online', journeyName, channelSource, globals);
  currentFormContext.journeyID = globals.form.runtime.journeyId.$value || journeyID;
  currentFormContext.journeyName = SEMI_CONSTANT.JOURNEY_NAME;
  const jsonObj = {
    requestString: {
      mobileNo: mobileNumber,
      cardNo: cardDigits,
      journeyID: currentFormContext.journeyID,
      journeyName: currentFormContext.journeyName,
    },
  };
  const path = semiEndpoints.otpGen;
  formRuntime?.getOtpLoader();
  return fetchJsonResponse(path, jsonObj, 'POST', true);
}

/**
 * generates the otp
 * @param {string} mobileNumber
 * @param {string} cardDigits
 * @param {object} globals
 * @return {PROMISE}
 */
function otpValidation(mobileNumber, cardDigits, otpNumber) {
  const jsonObj = {
    requestString: {
      mobileNo: mobileNumber,
      cardNo: cardDigits,
      OTP: otpNumber,
      proCode: PRO_CODE,
      journeyID: currentFormContext.journeyID,
      journeyName: currentFormContext.journeyName,
      // channel: 'ADOBE_WHATSAPP',
    },
  };
  const path = semiEndpoints.otpVal;
  formRuntime?.otpValLoader();
  return fetchJsonResponse(path, jsonObj, 'POST', true);
}

/**
* @param {resPayload} Object - checkEligibility response.
* @return {PROMISE}
*/
// eslint-disable-next-line no-unused-vars
function checkELigibilityHandler(resPayload) {
}

export {
  getOTPV1,
  otpValidation,
  checkELigibilityHandler,
};
