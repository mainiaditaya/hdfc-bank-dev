import { fetchJsonResponse } from '../../common/makeRestAPI.js';
import * as SEMI_CONSTANT from './constant.js';
import {
  createJourneyId,
} from '../../common/journey-utils.js';

const currentFormContext = {};
currentFormContext.journeyID = createJourneyId('online', 'SEMI', 'ADOBE_WEB');

/**
 * generates the otp
 * @param {string} mobileNumber
 * @param {string} cardDigits
 * @param {object} globals
 * @return {PROMISE}
 */
function getOTPV1(mobileNumber, cardDigits, globals) {
  const jsonObj = {
    requestString: {
      mobileNumber: mobileNumber.$value,
      cardDigits: cardDigits.$value || '',
      journeyID: currentFormContext.journeyID,
      journeyName: currentFormContext.journeyName,
      userAgent: window.navigator.userAgent,
    },
  };
  const path = SEMI_CONSTANT.SEMI_ENDPOINTS.otpGen;

  return fetchJsonResponse(path, jsonObj, 'POST', true);
}

export {
  // eslint-disable-next-line import/prefer-default-export
  getOTPV1,
};
