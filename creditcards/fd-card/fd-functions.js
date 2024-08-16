import {
  validateLogin,
  otpTimer,
  maskedMobNum,
  getOTP,
  otpValidation,
  resendOTP,
  customSetFocus,
  reloadPage,
} from './fdlien-functions.js';
import {
  invokeJourneyDropOff,
  fdWizardSwitch,
} from './fd-journey-util.js';

// import { getOTP, otpValidation } from '../../common/functions.js'; // improvisation required to make it generic, till then using the journey specific function getotp,otpVal 👆
import { redirect } from '../../common/functions.js';

import createJourneyId from '../../common/journey-utils.js';

import {
  addGaps,
  addMobileValidation,
  validateOtpInput,
  updateElementAttr,
  changeCheckboxToToggle,
} from './fd-dom-functions.js';

import {
  fetchCustomerId,
  customerIdSuccessHandler,
  customerIdClickHandler,
} from './customeridutil.js';

export {
  getOTP,
  otpTimer,
  otpValidation,
  validateLogin,
  createJourneyId,
  maskedMobNum,
  addGaps,
  addMobileValidation,
  redirect,
  resendOTP,
  customSetFocus,
  reloadPage,
  validateOtpInput,
  invokeJourneyDropOff,
  updateElementAttr,
  fdWizardSwitch,
  changeCheckboxToToggle,
  fetchCustomerId,
  customerIdSuccessHandler,
  customerIdClickHandler,
};
