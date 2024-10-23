import {
  validateLogin,
  otpTimer,
  maskedMobNum,
  getOTP,
  otpValidation,
  resendOTP,
  customSetFocus,
  reloadPage,
  pincodeChangeHandler,
  checkModeFd,
} from './fdlien-functions.js';

import {
  invokeJourneyDropOff,
  fdWizardSwitch,
  journeyResponseHandler,
  invokeJourneyDropOffUpdate,
} from './fd-journey-util.js';

import {
  bindCustomerDetails,
  channelChangeHandler,
  validateEmailID,
  dsaCodeHandler,
  branchCodeHandler,
  dobChangeHandler,
  fathersNameChangeHandler,
  fullNameChangeHandler,
  checkPanValidation,
  panvalidationSuccessHandler,
  addressChangeHandler,
} from './customerdetails.js';

// import { getOTP, otpValidation } from '../../common/functions.js'; // improvisation required to make it generic, till then using the journey specific function getotp,otpVal 👆
import {
  redirect,
  validatePan,
  idcomRedirection,
  aadharInit,
  loadHomePage,
} from '../../common/functions.js';

import { createJourneyId } from '../../common/journey-utils.js';

import {
  docUploadClickHandler,
  fileUploadUIHandler,
  docUploadBiometricHandler,
} from './docuploadutil.js';

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
  fetchReferenceId,
} from './customeridutil.js';

import {
  customerIdProceedHandler,
  fdSelectHandler,
  resetFDSelection,
  selectAllFdClickHandler,
} from './fddetailsutil.js';

import {
  executeInterface,
  executeInterfacePostRedirect,
} from './executeinterfaceutil.js';

import {
  confirmCardClickHandler,
  knowMoreCardClickHandler,
  selectCardBackClickHandler,
  cardSelectHandler,
  popupBackClickHandler,
} from './confirmcardutil.js';

import {
  ipa,
  fdIpaSuccessHandler,
} from './ipautil.js';

import { idcomm, idcomSuccessHandler } from './idcomutil.js';

import {
  kycProceedClickHandler,
  addressDeclarationProceedHandler,
  aadhaarConsent,
} from './kycUtil.js';

import { ratingButtonUI, copyToClipBoard } from './thankyouutil.js';
import sendFDAnalytics from './analytics.js';

import { hideLoaderGif } from '../domutils/domutils.js';

import { fullNamePanValidation } from '../../common/panvalidation.js';

setTimeout(() => import('./launch-dev.min.js'), 100);

setTimeout(() => import('./fd-delayedutils.js'), 2000);

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
  bindCustomerDetails,
  fdSelectHandler,
  customerIdProceedHandler,
  selectAllFdClickHandler,
  resetFDSelection,
  validateEmailID,
  pincodeChangeHandler,
  channelChangeHandler,
  validatePan,
  dsaCodeHandler,
  branchCodeHandler,
  dobChangeHandler,
  fathersNameChangeHandler,
  executeInterface,
  fetchReferenceId,
  confirmCardClickHandler,
  ipa,
  fdIpaSuccessHandler,
  knowMoreCardClickHandler,
  selectCardBackClickHandler,
  cardSelectHandler,
  popupBackClickHandler,
  docUploadClickHandler,
  fileUploadUIHandler,
  journeyResponseHandler,
  invokeJourneyDropOffUpdate,
  idcomRedirection,
  idcomm,
  idcomSuccessHandler,
  kycProceedClickHandler,
  addressDeclarationProceedHandler,
  aadhaarConsent,
  aadharInit,
  docUploadBiometricHandler,
  checkModeFd,
  executeInterfacePostRedirect,
  ratingButtonUI,
  copyToClipBoard,
  sendFDAnalytics,
  fullNameChangeHandler,
  hideLoaderGif,
  checkPanValidation,
  panvalidationSuccessHandler,
  addressChangeHandler,
  fullNamePanValidation,
  loadHomePage,
};
