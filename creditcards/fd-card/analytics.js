/* eslint-disable no-undef */
import { ANALYTICS_PAGE_LOAD_OBJECT, ANALYTICS_CLICK_OBJECT, PAGE_NAME } from '../../common/analyticsConstants.js';
import { CURRENT_FORM_CONTEXT } from '../../common/constants.js';
import { setAnalyticPageLoadProps, setAnalyticClickGenericProps, hashPhoneNumber } from '../../common/formanalytics.js';
import { createDeepCopyFromBlueprint, santizedFormDataWithContext } from '../../common/formutils.js';
import { ANALYTICS } from './constant.js';

/**
 * Sends analytics event on page load.
 * @name sendPageloadEvent
 * @param {string} journeyState.
 * @param {object} formData.
 * @param {string} pageName.
 */
function sendPageloadEvent(journeyState, formData, pageName, nextPage = '') {
  const digitalData = createDeepCopyFromBlueprint(ANALYTICS_PAGE_LOAD_OBJECT);
  digitalData.page.pageInfo.pageName = pageName;
  setAnalyticPageLoadProps(journeyState, formData, digitalData, ANALYTICS.formName);
  switch (nextPage) {
    case 'selectCustomerId':
      digitalData.formDetails.eligibleCustomerID = '';
      break;
    case 'selectCard':
      digitalData.card.eligibleCard = '';
      break;
    case 'confirmationPage':
      digitalData.formDetails.reference = '';
      digitalData.formDetails.isVideoKYC = '';
      break;
    default:
      // do nothing
  }
  if (window) {
    window.digitalData = digitalData || {};
  }
  _satellite.track('pageload');
}

/**
 *Creates digital data for otp click event.
 * @param {string} phone
 * @param {string} eventType
 * @param {string} linkType
 * @param {object} formData
 * @param {string} journeyState
 * @param {object} digitalData
 */
const sendSubmitClickEvent = async (eventType, formData, journeyState, digitalData) => {
  formData.etbFlowSelected = 'on';
  setAnalyticClickGenericProps(ANALYTICS.event[eventType].name, ANALYTICS.event[eventType].type, formData, journeyState, digitalData, ANALYTICS.formName);
  digitalData.form.name = ANALYTICS.formName;
  // const phone = formData?.login?.registeredMobileNumber;
  digitalData.page.pageInfo.pageName = PAGE_NAME.fd[eventType];
  switch (eventType) {
    case 'getOtp':
      digitalData.event.status = '';
      digitalData.event.validationMethod = (formData.form.login.panDobSelection === '0') ? 'DOB' : 'PAN';
      digitalData.event.phone = await hashPhoneNumber(formData.form.login.registeredMobileNumber);
      _satellite.track('submit');
      sendPageloadEvent(ANALYTICS.event.submitOtp.journeyState, formData, ANALYTICS.event.submitOtp.pageName, ANALYTICS.event.getOtp.nextPage);
      break;
    case 'submitOtp':
      digitalData.event.status = 1;
      _satellite.track('submit');
      sendPageloadEvent(ANALYTICS.event.submitOtp.journeyState, formData, ANALYTICS.event.submitOtp.pageName, ANALYTICS.event.submitOtp.nextPage);
      break;
    case 'selectCustomerId':
      digitalData.event.status = '';
      _satellite.track('submit');
      sendPageloadEvent(ANALYTICS.event.submitOtp.journeyState, formData, ANALYTICS.event.submitOtp.pageName, ANALYTICS.event.selectCustomerId.nextPage);
      break;
    case 'selectFd':
      digitalData.formDetails.FDSelected = formData.FDlienCard.fdNumberSelection
        .filter((fd) => fd.fdAccSelect === 'on')
        .map((fd) => fd.fdNumber);
      digitalData.card.newLimit = formData.maxCreditLimit;
      _satellite.track('submit');
      sendPageloadEvent(ANALYTICS.event.submitOtp.journeyState, formData, ANALYTICS.event.selectFd.pageName, ANALYTICS.event.selectFd.nextPage);
      break;
    case 'reviewDetailsBack':
      digitalData.event.status = '1';
      _satellite.track('submit');
      sendPageloadEvent(ANALYTICS.event.submitOtp.journeyState, formData, ANALYTICS.event.selectFd.pageName, ANALYTICS.event.selectFd.nextPage);
      break;
    case 'reviewDetails':
      digitalData.user.gender = (formData.FDlienCard.gender === '1') ? 'Male' : 'Female';
      digitalData.user.email = formData.emailID;
      digitalData.assisted = {};
      digitalData.assisted.flag = formData.employeeAssistanceToggle;
      digitalData.formDetails.pincode = formData.currentFormContext.executeInterfaceRequest.requestString.permanentZipCode;
      digitalData.formDetails.city = formData.currentFormContext.executeInterfaceRequest.requestString.permanentCity;
      digitalData.formDetails.state = formData.currentFormContext.executeInterfaceRequest.requestString.permanentState;
      digitalData.formDetails.employmentType = formData.employmentType;
      digitalData.formDetails.AnnualIncome = formData.FDlienCard.annualIncome;
      digitalData.assisted.flag = formData.employeeAssistanceToggle;
      digitalData.assisted.lg = formData.lgCode;
      digitalData.assisted.lc = formData.lc1Code;
      digitalData.assisted.channel = formData.channel;
      digitalData.assisted.dsa = formData.dsaCode;
      digitalData.assisted.sm = formData.smCode;
      digitalData.assisted.lc2 = formData.lc2Code;
      _satellite.track('submit');
      sendPageloadEvent(ANALYTICS.event.submitOtp.journeyState, formData, ANALYTICS.event.selectFd.pageName, ANALYTICS.event.reviewDetails.nextPage);
      break;
    case 'selectCard':
      digitalData.card.selectedCard = formData.currentFormContext.selectedCreditCard.cardProductCode;
      digitalData.card.annualFee = formData.currentFormContext.selectedCreditCard.annualFee;
      _satellite.track('submit');
      sendPageloadEvent(ANALYTICS.event.submitOtp.journeyState, formData, ANALYTICS.event.selectFd.pageName, ANALYTICS.event.selectCard.nextPage);
      break;
    case 'validationMethodKYC':
      if (formData.form.aadharEKYCVerification && formData.form.aadharEKYCVerification === '0') {
        digitalData.event.validationMethod = 'aadharEKYCVerification';
      } else if (formData.form.officiallyValidDocumentsMethod && formData.form.officiallyValidDocumentsMethod === '0') {
        digitalData.event.validationMethod = 'officiallyValidDocumentsMethod';
      }
      _satellite.track('submit');
      sendPageloadEvent(ANALYTICS.event.submitOtp.journeyState, formData, ANALYTICS.event.selectFd.pageName, ANALYTICS.event.validationMethodKYC.nextPage);
      break;
    case 'aadhaarKYCLangPopup':
      digitalData.formDetails.languageSelected = '';
      _satellite.track('submit');
      sendPageloadEvent(ANALYTICS.event.submitOtp.journeyState, formData, ANALYTICS.event.selectFd.pageName, ANALYTICS.event.selectCard.nextPage);
      break;
    case 'docUpload':
      digitalData.formDetails.documentProof = `ID Proof: ${formData.DocUploadFront.name}, Address Proof: ${formData.addressProofFile1.name}`;
      _satellite.track('submit');
      sendPageloadEvent(ANALYTICS.event.submitOtp.journeyState, formData, ANALYTICS.event.selectFd.pageName, ANALYTICS.event.docUpload.nextPage);
      break;
    case 'confirmationPage':
      digitalData.event.rating = '';
      _satellite.track('submit');
      sendPageloadEvent(ANALYTICS.event.submitOtp.journeyState, formData, ANALYTICS.event.selectFd.pageName, ANALYTICS.event.confirmationPage.nextPage);
      break;
    default:
  }
};

/**
 * Send analytics events.
 * @param {string} eventType
 * @param {object} payload
 * @param {string} journeyState
 * @param {object} formData
 * @param {object} currentFormContext
 */
const sendAnalyticsFDClickEvent = (eventType, payload, journeyState, formData) => {
  const digitalData = createDeepCopyFromBlueprint(ANALYTICS_CLICK_OBJECT);
  sendSubmitClickEvent(eventType, formData, journeyState, digitalData);
};

/**
* sendAnalytics
* @param {string} eventType
* @param {string} pageName
* @param {string} payload
* @param {string} journeyState
* @param {object} globals
*/
const sendFDAnalytics = (eventType, pageName, payload, journeyState, globals) => {
  const formData = santizedFormDataWithContext(globals, CURRENT_FORM_CONTEXT);
  if (eventType.toLowerCase() === 'page load') {
    sendPageloadEvent(journeyState, formData, pageName);
  } else {
    sendAnalyticsFDClickEvent(eventType, payload, journeyState, formData);
  }
};

export default sendFDAnalytics;
