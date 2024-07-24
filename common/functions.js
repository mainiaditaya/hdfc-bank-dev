/* eslint-disable no-console */
import {
  corpCreditCardContext,
  journeyResponseHandler,
  createJourneyId,
  sendAnalytics,
  resendOTP,
  formRuntime,
  customSetFocus,
  validateLogin,
  getAddressDetails,
  pinCodeMaster,
  validateEmailID,
  currentAddressToggleHandler,
  otpValHandler,
  setNameOnCard,
  prefillForm,
  getThisCard,
  aadharConsent123,
} from '../creditcards/corporate-creditcard/corporate-creditcardFunctions.js';

import {
  validatePan,
  panAPISuccesHandler,
} from './panvalidation.js';

import {
  executeInterfaceApiFinal,
  executeInterfaceApi,
  ipaRequestApi,
  ipaSuccessHandler,
  executeInterfaceResponseHandler,
} from './executeinterfaceutils.js';

import {
  urlPath, getTimeStamp, clearString,
} from './formutils.js';

import {
  fetchJsonResponse, hideLoaderGif,
} from './makeRestAPI.js';

import * as CONSTANT from './constants.js';
import * as CC_CONSTANT from '../creditcards/corporate-creditcard/constant.js';

const { ENDPOINTS } = CONSTANT;
const { JOURNEY_NAME } = CC_CONSTANT;
const { currentFormContext } = corpCreditCardContext;

// dynamically we can change according to journey
const journeyNameConstant = JOURNEY_NAME;

/**
 * generates the otp
 * @param {object} mobileNumber
 * @param {object} pan
 * @param {object} dob
 * @param {object} globals
 * @return {PROMISE}
 */
function getOTP(mobileNumber, pan, dob, globals) {
  currentFormContext.action = 'getOTP';
  currentFormContext.journeyID = globals.form.runtime.journeyId.$value;
  const jsonObj = {
    requestString: {
      mobileNumber: mobileNumber.$value,
      dateOfBith: dob.$value || '',
      panNumber: pan.$value || '',
      journeyID: globals.form.runtime.journeyId.$value,
      journeyName: journeyNameConstant,
      identifierValue: pan.$value || dob.$value,
      identifierName: pan.$value ? 'PAN' : 'DOB',
    },
  };
  const path = urlPath(ENDPOINTS.otpGen);
  formRuntime?.getOtpLoader();
  return fetchJsonResponse(path, jsonObj, 'POST', true);
}

/**
 * validates the otp
 * @param {object} mobileNumber
 * @param {object} pan
 * @param {object} dob
 * @return {PROMISE}
 */
function otpValidation(mobileNumber, pan, dob, otpNumber) {
  const referenceNumber = `AD${getTimeStamp(new Date())}` ?? '';
  currentFormContext.referenceNumber = referenceNumber;
  const jsonObj = {
    requestString: {
      mobileNumber: mobileNumber.$value,
      passwordValue: otpNumber.$value,
      dateOfBirth: clearString(dob.$value) || '',
      panNumber: pan.$value || '',
      channelSource: '',
      journeyID: currentFormContext.journeyID,
      journeyName: journeyNameConstant,
      dedupeFlag: 'N',
      referenceNumber: referenceNumber ?? '',
    },
  };
  const path = urlPath(ENDPOINTS.otpValFetchAssetDemog);
  formRuntime?.otpValLoader();
  return fetchJsonResponse(path, jsonObj, 'POST', true);
}

export {
  getOTP,
  otpValidation,
  customSetFocus,
  journeyResponseHandler,
  corpCreditCardContext,
  createJourneyId,
  sendAnalytics,
  resendOTP,
  hideLoaderGif,
  validateLogin,
  getAddressDetails,
  pinCodeMaster,
  validateEmailID,
  currentAddressToggleHandler,
  otpValHandler,
  setNameOnCard,
  prefillForm,
  getThisCard,
  validatePan,
  panAPISuccesHandler,
  executeInterfaceApi,
  executeInterfaceApiFinal,
  ipaRequestApi,
  ipaSuccessHandler,
  executeInterfaceResponseHandler,
  aadharConsent123,
};
