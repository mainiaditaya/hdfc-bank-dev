/* eslint-disable import/no-cycle */
import {
  validateLogin,
  getOtpNRE,
  otpTimer,
  otpValidationNRE,
  updateOTPHelpText,
  getCountryCodes,
  resendOTP,
  customFocus,
  switchWizard,
  addPageNameClassInBody,
  showFinancialDetails,
  showNomineeDetails,
  multiCustomerId,
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
  getCountryCodes,
  resendOTP,
  customFocus,
  otpValidationNRE,
  switchWizard,
  addPageNameClassInBody,
  showFinancialDetails,
  showNomineeDetails,
  multiCustomerId,
};
