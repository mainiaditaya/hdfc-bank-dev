/* eslint-disable no-undef */
import { ANALYTICS_PAGE_LOAD_OBJECT, ANALYTICS_CLICK_OBJECT, PAGE_NAME } from '../../common/analyticsConstants.js';
import { CURRENT_FORM_CONTEXT } from '../../common/constants.js';
import { setAnalyticPageLoadProps, setAnalyticClickGenericProps } from '../../common/formanalytics.js';
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
    case 'reviewDetails':
      digitalData.formDetails.eligibleCustomerID = '';
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
const sendSubmitClickEvent = (eventType, formData, journeyState, digitalData) => {
  formData.etbFlowSelected = 'on';
  setAnalyticClickGenericProps(ANALYTICS.event[eventType].name, ANALYTICS.event[eventType].type, formData, journeyState, digitalData, ANALYTICS.formName);
  digitalData.form.name = ANALYTICS.formName;
  // const phone = formData?.login?.registeredMobileNumber;
  digitalData.page.pageInfo.pageName = PAGE_NAME.fd[eventType];
  switch (eventType) {
    case 'getOtp':
      digitalData.event.status = '';
      digitalData.event.validationMethod = (formData.form.login.panDobSelection === '0') ? 'DOB' : 'PAN';
      digitalData.event.phone = formData.form.login.registeredMobileNumber;
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
      sendPageloadEvent(ANALYTICS.event.submitOtp.journeyState, formData, ANALYTICS.event.submitOtp.pageName);
      break;
    case 'selectFd':
      digitalData.formDetails.FDSelected = '';
      digitalData.card.newLimit = '';
      _satellite.track('submit');
      sendPageloadEvent(ANALYTICS.event.submitOtp.journeyState, formData, ANALYTICS.event.submitOtp.pageName);
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
