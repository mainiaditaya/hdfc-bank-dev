import {
  ageValidator, clearString, getTimeStamp, maskNumber, urlPath,
} from '../../common/formutils.js';
import * as FD_CONSTANT from './constant.js';
import * as CONSTANT from '../../common/constants.js';
import { displayLoader, fetchJsonResponse } from '../../common/makeRestAPI.js';
import { createJourneyId } from '../../common/journey-utils.js';

const { FORM_RUNTIME: formRuntime, CURRENT_FORM_CONTEXT: currentFormContext, CHANNEL } = CONSTANT;
const { JOURNEY_NAME, FD_ENDPOINTS } = FD_CONSTANT;
// Initialize all Fd Card Journey Context Variables & formRuntime variables.
currentFormContext.journeyName = JOURNEY_NAME;
formRuntime.getOtpLoader = displayLoader;
formRuntime.otpValLoader = displayLoader;

const validFDPan = (val) => {
  // FD_CONSTANT.REGEX_PAN?.test(val?.toLocaleUpperCase()); // this one did'nt work properly as expected ,
  // Check if the input length is exactly 10 characters
  if (val?.length !== 10) return false;

  // Check the first 5 characters for alphabets
  if (![...val.slice(0, 5)]?.every((c) => /[a-zA-Z]/.test(c))) return false;

  // Check the next 4 characters for digits
  if (![...val.slice(5, 9)]?.every((c) => /\d/.test(c))) return false;

  // Check the last character for an alphabet
  if (!/[a-zA-Z]/.test(val[9])) return false;

  return true;
};
/**
 * Validates the date of birth field to ensure the age is between 18 and 70.
 * @param {Object} globals - The global object containing necessary data for DAP request.
*/
const validateLogin = (globals) => {
  const dobValue = globals.form.loginMainPanel.loginPanel.identifierPanel.dateOfBirth.$value;
  const panValue = (globals.form.loginMainPanel.loginPanel.identifierPanel.pan.$value)?.replace(/\s+/g, ''); // remove white space
  const panDobSelection = globals.form.loginMainPanel.loginPanel.identifierPanel.panDobSelection.$value;
  const mobileNo = globals.form.loginMainPanel.loginPanel.mobilePanel.registeredMobileNumber.$value;
  const radioSelect = (panDobSelection === '0') ? 'DOB' : 'PAN';
  const panErrorText = FD_CONSTANT.ERROR_MSG.panError;

  const panInput = document.querySelector(`[name=${'pan'} ]`);
  const panWrapper = panInput.parentElement;

  const panIsValid = validFDPan(panValue);
  const dobIsValid = ageValidator(FD_CONSTANT.AGE_LIMIT.min, FD_CONSTANT.AGE_LIMIT.max, dobValue);
  const mobIsValid = (mobileNo && mobileNo?.length === 10);

  switch (radioSelect) {
    case 'DOB':
      if (dobValue && String(new Date(dobValue).getFullYear()).length === 4) {
        const dobErrorText = FD_CONSTANT.ERROR_MSG.ageLimit;
        if (dobIsValid && (mobIsValid)) {
          globals.functions.setProperty(globals.form.loginMainPanel.getOTPbutton, { enabled: true });
          globals.functions.markFieldAsInvalid('$form.loginMainPanel.loginPanel.identifierPanel.dateOfBirth', '', { useQualifiedName: true });
        }
        if (dobIsValid) {
          globals.functions.markFieldAsInvalid('$form.loginMainPanel.loginPanel.identifierPanel.dateOfBirth', '', { useQualifiedName: true });
          globals.functions.setProperty(globals.form.loginMainPanel.loginPanel.identifierPanel.dateOfBirth, { valid: true });
        }
        if (!dobIsValid) {
          globals.functions.markFieldAsInvalid('$form.loginMainPanel.loginPanel.identifierPanel.dateOfBirth', dobErrorText, { useQualifiedName: true });
          globals.functions.setProperty(globals.form.loginMainPanel.getOTPbutton, { enabled: false });
        }
        if (!(mobIsValid)) {
          globals.functions.setProperty(globals.form.loginMainPanel.getOTPbutton, { enabled: false });
        }
      }
      break;
    case 'PAN':
      panWrapper.setAttribute('data-empty', true);
      if (panValue) {
        panWrapper.setAttribute('data-empty', false);
        if (panIsValid && (mobIsValid)) {
          globals.functions.markFieldAsInvalid('$form.loginMainPanel.loginPanel.identifierPanel.pan', '', { useQualifiedName: true });
          globals.functions.setProperty(globals.form.loginMainPanel.getOTPbutton, { enabled: true });
        }
        if (panIsValid) {
          globals.functions.markFieldAsInvalid('$form.loginMainPanel.loginPanel.identifierPanel.pan', '', { useQualifiedName: true });
          globals.functions.setProperty(globals.form.loginMainPanel.loginPanel.identifierPanel.pan, { valid: true });
        }
        if (!panIsValid) {
          globals.functions.markFieldAsInvalid('$form.loginMainPanel.loginPanel.identifierPanel.pan', panErrorText, { useQualifiedName: true });
          globals.functions.setProperty(globals.form.loginMainPanel.getOTPbutton, { enabled: false });
        }
        if (!(mobIsValid)) {
          globals.functions.setProperty(globals.form.loginMainPanel.getOTPbutton, { enabled: false });
        }
      }
      break;
    default:
      globals.functions.setProperty(globals.form.loginMainPanel.getOTPbutton, { enabled: false });
  }
};

/**
 * Starts the timer for resending OTP.
 * @param {Object} globals - The global object containing necessary data for DAP request.
*/
function otpTimer(globals) {
  let sec = FD_CONSTANT.OTP_TIMER;
  const timer = setInterval(() => {
    globals.functions.setProperty(globals.form.otpPanelWrapper.otpPanel.otpPanel.secondsPanel.seconds, { value: sec });
    sec -= 1;
    if (sec < 0) {
      clearInterval(timer);
      document.querySelector('.field-secondspanel').setAttribute('data-visible', 'false');
      document.querySelector('.field-otpresend').setAttribute('data-visible', 'true');
    }
  }, 1000);
}

/**
 * Starts the timer for resending OTP.
 * @param {Object} globals - The global object containing necessary data for DAP request.
 * @param {string} mobileNo - Registered mobile number
*/
const maskedMobNum = (mobileNo, globals) => {
  if (!(mobileNo?.length === 10)) return;
  globals.functions.setProperty(globals.form.loginMainPanel.maskedMobileNumber, { value: `${maskNumber(mobileNo, 6)}.` });
};

/* loadFDStyles - for loading fd - styles - temporary fix */
async function loadFDStyles() {
  if (document.querySelector('.fd-form-wrapper')) {
    document.body.classList.add('fdlien');
  }
}
window.setTimeout(() => loadFDStyles(), 600);

/**
 * generates the otp
 * @param {object} mobileNumber
 * @param {object} pan
 * @param {object} dob
 * @param {object} globals
 * @return {PROMISE}
 */
const getOTP = (mobileNumber, pan, dob, globals) => {
  const jidTemporary = createJourneyId('online', globals.form.runtime.journeyName.$value, CHANNEL, globals);
  currentFormContext.action = 'getOTP';
  currentFormContext.journeyID = globals.form.runtime.journeyId.$value || jidTemporary;
  currentFormContext.leadIdParam = globals.functions.exportData().queryParams;
  const panValue = (pan.$value)?.replace(/\s+/g, ''); // remove white space
  const jsonObj = {
    requestString: {
      dateOfBirth: clearString(dob.$value) || '',
      mobileNumber: mobileNumber.$value,
      panNumber: panValue || '',
      journeyID: globals.form.runtime.journeyId.$value ?? jidTemporary,
      journeyName: globals.form.runtime.journeyName.$value || currentFormContext.journeyName,
      identifierValue: panValue || dob.$value,
      identifierName: panValue ? 'PAN' : 'DOB',
    },
  };
  const path = urlPath(FD_ENDPOINTS.otpGen);
  formRuntime?.getOtpLoader();
  return fetchJsonResponse(path, jsonObj, 'POST', true);
};

/**
 * validates the otp
 * @param {object} mobileNumber
 * @param {object} pan
 * @param {object} dob
 * @return {PROMISE}
 */
const otpValidation = (mobileNumber, pan, dob, otpNumber, globals) => {
  const referenceNumber = `AD${getTimeStamp(new Date())}` ?? '';
  currentFormContext.referenceNumber = referenceNumber;
  const panValue = (pan.$value)?.replace(/\s+/g, ''); // remove white space
  const jsonObj = {
    requestString: {
      mobileNumber: mobileNumber.$value,
      passwordValue: otpNumber.$value,
      dateOfBirth: clearString(dob.$value) || '',
      panNumber: panValue || '',
      channelSource: '',
      journeyID: currentFormContext.journeyID,
      journeyName: globals.form.runtime.journeyName.$value || currentFormContext.journeyName,
      dedupeFlag: 'N',
      referenceNumber: referenceNumber ?? '',
    },
  };
  const path = urlPath(FD_ENDPOINTS.otpVal);
  formRuntime?.otpValLoader();
  return fetchJsonResponse(path, jsonObj, 'POST', true);
};

export {
  // eslint-disable-next-line import/prefer-default-export
  validateLogin,
  otpTimer,
  maskedMobNum,
  getOTP,
  otpValidation,
};
