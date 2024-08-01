import { ageValidator } from '../../common/formutils.js';
import * as FD_CONSTANT from './constant.js';
import * as CONSTANT from '../../common/constants.js';
import { displayLoader } from '../../common/makeRestAPI.js';

const { FORM_RUNTIME: formRuntime, CURRENT_FORM_CONTEXT: currentFormContext } = CONSTANT;
const { JOURNEY_NAME } = FD_CONSTANT;
// Initialize all Fd Card Journey Context Variables & formRuntime variables.
currentFormContext.journeyName = JOURNEY_NAME;
formRuntime.getOtpLoader = displayLoader;
formRuntime.otpValLoader = displayLoader;

/**
 * Validates the date of birth field to ensure the age is between 18 and 70.
 * @param {Object} globals - The global object containing necessary data for DAP request.
*/
const validateLogin = (globals) => {
  const dobValue = globals.form.loginMainPanel.loginPanel.identifierPanel.dateOfBirth.$value;
  const panValue = globals.form.loginMainPanel.loginPanel.identifierPanel.pan.$value;
  const panDobSelection = globals.form.loginMainPanel.loginPanel.identifierPanel.panDobSelection.$value;
  const mobileNo = globals.form.loginMainPanel.loginPanel.mobilePanel.registeredMobileNumber.$value;
  const radioSelect = (panDobSelection === '0') ? 'DOB' : 'PAN';
  const regexPan = FD_CONSTANT.REGEX_PAN;
  const panErrorText = FD_CONSTANT.ERROR_MSG.panError;

  const panInput = document.querySelector(`[name=${'pan'} ]`);
  const panWrapper = panInput.parentElement;
  if (mobileNo?.length < 10) {
    globals.functions.markFieldAsInvalid(globals.form.loginMainPanel.loginPanel.mobilePanel.registeredMobileNumber.$qualifiedName, FD_CONSTANT.ERROR_MSG.mobileError, { useQualifiedName: true });
    globals.functions.setProperty(globals.form.loginMainPanel.getOTPbutton, { enabled: false });
  } else {
    globals.functions.markFieldAsInvalid(globals.form.loginMainPanel.loginPanel.mobilePanel.registeredMobileNumber.$qualifiedName, '', { useQualifiedName: true });
    globals.functions.setProperty(globals.form.loginMainPanel.loginPanel.mobilePanel.registeredMobileNumber, { valid: true });
    switch (radioSelect) {
      case 'DOB':
        if (dobValue && String(new Date(dobValue).getFullYear()).length === 4) {
          const dobErrorText = FD_CONSTANT.ERROR_MSG.ageLimit;
          const ageValid = ageValidator(FD_CONSTANT.AGE_LIMIT.min, FD_CONSTANT.AGE_LIMIT.max, dobValue);
          if (ageValid && (mobileNo?.length === 10)) {
            globals.functions.setProperty(globals.form.loginMainPanel.getOTPbutton, { enabled: true });
            globals.functions.markFieldAsInvalid('$form.loginMainPanel.loginPanel.identifierPanel.dateOfBirth', '', { useQualifiedName: true });
          }
          if (ageValid) {
            globals.functions.markFieldAsInvalid('$form.loginMainPanel.loginPanel.identifierPanel.dateOfBirth', '', { useQualifiedName: true });
            globals.functions.setProperty(globals.form.loginMainPanel.loginPanel.identifierPanel.dateOfBirth, { valid: true });
          }
          if (!ageValid) {
            globals.functions.markFieldAsInvalid('$form.loginMainPanel.loginPanel.identifierPanel.dateOfBirth', dobErrorText, { useQualifiedName: true });
            globals.functions.setProperty(globals.form.loginMainPanel.getOTPbutton, { enabled: false });
          }
          if (!(mobileNo?.length === 10)) {
            globals.functions.setProperty(globals.form.loginMainPanel.getOTPbutton, { enabled: false });
          }
        }
        break;
      case 'PAN':
        panWrapper.setAttribute('data-empty', true);
        if (panValue) {
          panWrapper.setAttribute('data-empty', false);
          const validPan = regexPan.test(panValue);
          if (validPan && (mobileNo?.length === 10)) {
            globals.functions.markFieldAsInvalid('$form.loginMainPanel.loginPanel.identifierPanel.pan', '', { useQualifiedName: true });
            globals.functions.setProperty(globals.form.loginMainPanel.getOTPbutton, { enabled: true });
          }
          if (validPan) {
            globals.functions.markFieldAsInvalid('$form.loginMainPanel.loginPanel.identifierPanel.pan', '', { useQualifiedName: true });
            globals.functions.setProperty(globals.form.loginMainPanel.loginPanel.identifierPanel.pan, { valid: true });
          }
          if (!validPan) {
            globals.functions.markFieldAsInvalid('$form.loginMainPanel.loginPanel.identifierPanel.pan', panErrorText, { useQualifiedName: true });
            globals.functions.setProperty(globals.form.loginMainPanel.getOTPbutton, { enabled: false });
          }
          if (!(mobileNo?.length === 10)) {
            globals.functions.setProperty(globals.form.loginMainPanel.getOTPbutton, { enabled: false });
          }
        }
        break;
      default:
        globals.functions.setProperty(globals.form.loginMainPanel.getOTPbutton, { enabled: false });
    }
  }
};

/**
 * Starts the timer for resending OTP.
 * @param {Object} globals - The global object containing necessary data for DAP request.
*/
function otpTimer(globals) {
  let sec = 30;
  const timer = setInterval(() => {
    globals.functions.setProperty(globals.form.otpPanelWrapper.otpPanel.otpPanel.secondsPanel.seconds, { value: sec });
    sec--;
    if (sec < 0) {
      clearInterval(timer);
    }
  }, 1000);
}

/* loadFDStyles - for loading fd - styles - temporary fix */
async function loadFDStyles() {
  if (document.querySelector('.fd-form-wrapper')) {
    document.body.classList.add('fdlien');
  }
}
window.setTimeout(() => loadFDStyles(), 1000);

export {
  // eslint-disable-next-line import/prefer-default-export
  validateLogin,
  otpTimer,
};
