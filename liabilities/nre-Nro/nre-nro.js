/* eslint-disable import/no-cycle */
import {
  validateLogin,
  getOtpNRE,
  otpTimer,
  otpValidationNRE,
  updateOTPHelpText,
  prefillCustomerDetails,
  getCountryCodes,
  resendOTP,
  customFocus,
  switchWizard,
  setupBankUseSection,
  idComRedirection,
  addPageNameClassInBody,
} from './nre-nroFunctions.js';

import {
  invokeJourneyDropOff,
  invokeJourneyDropOffUpdate,
} from './nre-nro-journey-utils.js';

export {
  validateLogin,
  invokeJourneyDropOff,
  invokeJourneyDropOffUpdate,
  getOtpNRE,
  otpTimer,
  updateOTPHelpText,
  prefillCustomerDetails,
  getCountryCodes,
  resendOTP,
  customFocus,
  otpValidationNRE,
  switchWizard,
  setupBankUseSection,
  idComRedirection,
  addPageNameClassInBody,
};
