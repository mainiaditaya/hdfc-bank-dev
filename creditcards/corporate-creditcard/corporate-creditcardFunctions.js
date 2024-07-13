/* eslint no-console: ["error", { allow: ["warn", "error"] }] */
import {
  invokeJourneyDropOffUpdate,
  journeyResponseHandlerUtil,
  corpCreditCardContext,
  createJourneyId,
  formRuntime,
} from '../../common/journey-utils.js';
import {
  formUtil,
  urlPath,
  clearString,
  santizedFormDataWithContext,
} from '../../common/formutils.js';
import {
  restAPICall,
  displayLoader, hideLoaderGif,
} from '../../common/makeRestAPI.js';
import { sendAnalyticsEvent } from '../../common/analytics.js';
import * as CONSTANT from '../../common/constants.js';
import * as CC_CONSTANT from './constant.js';

const { ENDPOINTS } = CONSTANT;
const { JOURNEY_NAME } = CC_CONSTANT;
const journeyNameConstant = JOURNEY_NAME;
const { currentFormContext } = corpCreditCardContext;
// Initialize all Corporate Card Journey Context Variables.
currentFormContext.journeyName = journeyNameConstant;
currentFormContext.journeyType = 'NTB';
currentFormContext.formName = 'CorporateCreditCard';
currentFormContext.errorCode = '';
currentFormContext.errorMessage = '';
currentFormContext.eligibleOffers = '';

formRuntime.getOtpLoader = currentFormContext.getOtpLoader || (typeof window !== 'undefined') ? displayLoader : false;
formRuntime.otpValLoader = currentFormContext.otpValLoader || (typeof window !== 'undefined') ? displayLoader : false;
formRuntime.hideLoader = (typeof window !== 'undefined') ? hideLoaderGif : false;

let RESEND_OTP_COUNT = 3;
/**
 * @name journeyResponseHandler
 * @param {string} payload.
 */
function journeyResponseHandler(payload) {
  currentFormContext.leadProfile = journeyResponseHandlerUtil(String(payload.leadProfileId), currentFormContext)?.leadProfile;
}

/**
* sendAnalytics
* @param {string} payload
* @param {object} globals
*/
// eslint-disable-next-line no-unused-vars
function sendAnalytics(payload, globals) {
  sendAnalyticsEvent(payload, santizedFormDataWithContext(globals), currentFormContext);
}

/**
 * @name resendOTP
 * @param {Object} globals - The global object containing necessary data for DAP request.
 */
const resendOTP = (globals) => {
  const { mobilePanel: { registeredMobileNumber }, identifierPanel: { pan, dateOfBirth } } = globals.form.loginPanel;
  const mobileNo = registeredMobileNumber.$value;
  const panNo = pan.$value;
  const dob = clearString(dateOfBirth.$value);

  const errorResendOtp = (err, objectGlobals) => {
    const {
      otpPanel, submitOTP, resultPanel,
    } = objectGlobals.form;
    const hidePanel = [otpPanel, submitOTP]?.map((panel) => formUtil(objectGlobals, panel));
    const showPanel = [resultPanel]?.map((panel) => formUtil(objectGlobals, panel));
    hidePanel.forEach((item) => item.visible(false));
    showPanel.forEach((item) => item.visible(true));
  };

  const successResendOtp = (res, objectGlobals) => {
    RESEND_OTP_COUNT -= 1;
    invokeJourneyDropOffUpdate('ResendOtp', mobileNo, globals?.form.runtime.leadProifileId.$value, currentFormContext.journeyID, globals);
    if (!RESEND_OTP_COUNT) errorResendOtp(res, objectGlobals);
  };

  const payload = {
    requestString: {
      mobileNumber: String(mobileNo),
      dateOfBith: dob || '',
      panNumber: panNo || '',
      journeyID: globals.form.runtime.journeyId.$value,
      journeyName: journeyNameConstant,
      identifierValue: panNo || dob.$value,
      identifierName: panNo ? 'PAN' : 'DOB',
    },
  };
  const successCallback = (res, globalObj) => ((res?.otpGenResponse?.status?.errorCode === '0') ? successResendOtp(res, globalObj) : errorResendOtp(res, globalObj));
  const errorCallback = (err, globalObj) => errorResendOtp(err, globalObj);
  const loadingText = 'Please wait otp sending again...';
  const method = 'POST';
  const path = urlPath(ENDPOINTS.otpGen);
  try {
    restAPICall(globals, method, payload, path, successCallback, errorCallback, loadingText);
  } catch (error) {
    console.error(error);
  }
};

/**
 * does the custom show hide of panel or screens in resend otp.
 * @param {string} errorMessage
 * @param {number} numRetries
 * @param {object} globals
 */
function customSetFocus(errorMessage, numRetries, globals) {
  if (typeof numRetries === 'number' && numRetries < 1) {
    globals.functions.setProperty(globals.form.otpPanel, { visible: false });
    globals.functions.setProperty(globals.form.submitOTP, { visible: false });
    globals.functions.setProperty(globals.form.resultPanel, { visible: true });
    globals.functions.setProperty(globals.form.resultPanel.errorResultPanel, { visible: true });
    globals.functions.setProperty(globals.form.resultPanel.errorResultPanel.errorMessageText, { value: errorMessage });
  }
}

export {
  corpCreditCardContext,
  formRuntime,
  journeyResponseHandler,
  createJourneyId,
  sendAnalytics,
  resendOTP,
  customSetFocus,
};
