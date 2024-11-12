/* eslint-disable no-undef */
import {
  data,
  ANALYTICS_CLICK_OBJECT,
  ANALYTICS_PAGE_LOAD_OBJECT,
  PAGE_NAME,
} from './nreNroAnalyticsConstants.js';
import {
  createDeepCopyFromBlueprint,
  santizedFormDataWithContext,
} from '../../common/formutils.js';
import { FORM_NAME } from './constant.js';
import { CURRENT_FORM_CONTEXT as currentFormContext } from '../../common/constants.js';

/**
 * set analytics generic props for page load
 * @name setAnalyticPageLoadProps
 * @param {string} linkName - linkName
 * @param {string} linkType - linkName
 * @param {object} formContext - currentFormContext.
 * @param {object} digitalData
 */

function setAnalyticPageLoadProps(journeyState, formData, digitalData) {
  digitalData.user.pseudoID = '';// Need to check
  digitalData.user.journeyName = currentFormContext?.journeyName;
  digitalData.user.journeyID = formData?.journeyId;
  digitalData.user.journeyState = journeyState;
  digitalData.user.casa = '';
  digitalData.form.name = FORM_NAME;
}

// /**
//  * set analytics generic props for click event
//  * @name setAnalyticClickGenericProps
//  * @param {string} linkName - linkName
//  * @param {string} linkType - linkName
//  * @param {object} formContext - currentFormContext.
//  * @param {object} digitalData
//  */

function setAnalyticClickGenericProps(linkName, linkType, formData, journeyState, digitalData) {
  digitalData.link = {
    linkName,
    linkType,
  };
  digitalData.link.linkPosition = data[linkName].linkPosition;
  digitalData.user.pseudoID = '';
  digitalData.user.journeyName = currentFormContext?.journeyName;
  digitalData.user.journeyID = currentFormContext?.journeyID;
  digitalData.user.journeyState = journeyState;
  digitalData.form.name = FORM_NAME;
  digitalData.user.casa = '';
}

const getValidationMethod = (formContext) => {
  console.log(formContext);
  // if (formContext && formContext?.form?.login && formContext.login.panDobSelection) {
    return formContext?.form?.login?.panDobSelection === '0' ? 'DOB' : 'PAN';
  // }
  return '';
};

/**
 * Sends analytics event on page load.
 * @name sendPageloadEvent
 * @param {string} journeyState.
 * @param {object} formData.
 * @param {string} pageName.
 */
function sendPageloadEvent(journeyState, formData, pageName) {
  const digitalData = createDeepCopyFromBlueprint(ANALYTICS_PAGE_LOAD_OBJECT);
  digitalData.page.pageInfo.pageName = pageName;
  setAnalyticPageLoadProps(journeyState, formData, digitalData);
  switch (currentFormContext.action) {
    case 'Confirm Details': {
      // dataReq = getFatcaData(formData);
      // digitalData.formDetails.state = dataReq.state;
      // digitalData.formDetails.pincode = dataReq.pincode;
      // digitalData.formDetails.nationality = dataReq.nationality;
      // digitalData.formDetails.countryTaxResidence = dataReq.countryTaxResidence;
      // digitalData.formDetails.countryofBirth = dataReq.countryofBirth;
      // digitalData.nomineeRelation = dataReq.nomineeRelation;
      // digitalData.formDetails.companyName = dataReq.companyName;
      // digitalData.formDetails.AnnualIncome = dataReq.AnnualIncome;
      // digitalData.formDetails.currency = dataReq.currency;
      // digitalData.formDetails.residenceType = dataReq.residenceType;
      // digitalData.formDetails.sourceoffunds = dataReq.sourceoffunds;
      // digitalData.formDetails.selfemployeddate = dataReq.selfemployeddate;
      // digitalData.formDetails.natureofbusiness = dataReq.natureofbusiness;
      // digitalData.formDetails.typeofcompany = dataReq.typeofcompany;
      // digitalData.formDetails.typeofprofessional = dataReq.typeofprofessional;
      break;
    }
    default:
      // do nothing
  }
  if (window) {
    window.digitalData = digitalData || {};
  }
  _satellite.track('pageload');
}

// /**
//  *Creates digital data for otp click event.
//  * @param {string} phone
//  * @param {string} validationType
//  * @param {string} eventType
//  * @param {object} formContext
//  * @param {object} digitalData
//  */
function sendSubmitClickEvent(phone, eventType, linkType, formData, journeyState, digitalData) {
  setAnalyticClickGenericProps(eventType, linkType, formData, journeyState, digitalData);
  digitalData.page.pageInfo.pageName = PAGE_NAME.nrenro[eventType];
  switch (eventType) {
    case 'otp click': {
      if (window) {
        window.digitalData = digitalData || {};
      }
      _satellite.track('submit');
      currentFormContext.action = 'otp click';
      setTimeout(() => {
        sendPageloadEvent(journeyState, formData, PAGE_NAME.nrenro['confirm otp']);
      }, 1000);
      break;
    }
    case 'privacy consent click': {
      if (window) {
        window.digitalData = digitalData || {};
      }
      _satellite.track('submit');
      break;
    }
    case 'resend otp click': {
      digitalData.link.linkName = 'Resend OTP';
      if (window) {
        window.digitalData = digitalData || {};
      }
      _satellite.track('submit');
      break;
    }
    case 'mandatory I understand click': {
      if (window) {
        window.digitalData = digitalData || {};
      }
      _satellite.track('submit');
      break;
    }
    case 'optional I understand click': {
      if (window) {
        window.digitalData = digitalData || {};
      }
      _satellite.track('submit');
      break;
    }
    case 'submit otp click': {
      if (window) {
        window.digitalData = digitalData || {};
      }
      _satellite.track('submit');
      break;
    }
    case 'select account type click': {
      if (window) {
        window.digitalData = digitalData || {};
      }
      _satellite.track('submit');
      break;
    }
    case 'confirm details click': {
      if (window) {
        window.digitalData = digitalData || {};
      }
      _satellite.track('submit');
      break;
    }
    case 'confirm otp': {
      setTimeout(() => {
        sendPageloadEvent('CUSTOMER_IDENTITY_RESOLVED', formData, PAGE_NAME.ccc['check offers']);
      }, 1000);
      break;
    }
    default:
      // do nothing
  }
}

function populateResponse(payload, eventType, digitalData, formData) {
  switch (eventType) {
    case 'otp click': {
      let privacyConsent = '';
      let callSmsWhatsappConsent = '';
      let countryCode = '';
      // Check for privacy consent
      // if (formData && formData?.form && formData.form?.consent && formData.form.consent?.checkboxConsent1Label) {
      privacyConsent = formData?.form?.consent?.checkboxConsent1Label ?? '';
      // }
      // if (formData && formData?.form && formData.form?.consent && formData.form.consent?.checkboxConsent2Label) {
      callSmsWhatsappConsent = formData?.form?.consent?.checkboxConsent2Label ?? '';
      // }
      // if (formData && formData?.form && formData.form?.consent && formData.form.login?.countryCode) {
      countryCode = formData?.form?.login?.countryCode ?? '';
      // }
      digitalData.formDetails.privacyContent = privacyConsent;
      digitalData.formDetails.callSmsWhatsappConsent = callSmsWhatsappConsent;
      digitalData.event.validationMethod = getValidationMethod(formData);
      digitalData.formDetails.country = countryCode;
      break;
    }
    case 'privacy consent click': {
      digitalData.event.status = 'Success';
      break;
    }
    case 'mandatory I understand click': {
      digitalData.event.status = 'Success';
      break;
    }
    case 'optional I understand click': {
      digitalData.event.status = 'Success';
      break;
    }
    case 'resend otp click': {
      digitalData.event.status = 'Success';
      break;
    }
    case 'submit otp click': {
      digitalData.event.status = 'Success';
      break;
    }
    case 'select account type click': {
      let existingAccountType = '';
      let bankBranch = '';

      // if (formData && formData?.form && formData.form?.singleAccount && formData.form.singleAccount?.selectAccount && formData.form.singleAccount.selectAccount.accountType) {
      existingAccountType = formData?.form?.singleAccount?.selectAccount?.accountType;
      // }
      // if (formData && formData?.form && formData.form?.singleAccount && formData.form.singleAccount?.selectAccount && formData.form.singleAccount.selectAccount.branch) {
      bankBranch = formData?.form?.singleAccount?.selectAccount?.branch;
      // }
      digitalData.formDetails.existingAccountType = existingAccountType;
      digitalData.formDetails.bankBranch = bankBranch;
      break;
    }
    case 'confirm details click': {
      let bankUseToggle = '';
      let lgCode = '';
      let lcCode = '';
      let tAndCConsent = '';
      let detailsConsent = '';
      if (formData && formData?.bankUseToggle) {
        bankUseToggle = formData.bankUseToggle;
      }
      if (formData && formData?.lg) {
        lgCode = formData?.lg;
      }
      if (formData && formData?.lc) {
        lcCode = formData.lc;
      }
      if (formData && formData?.confirmDetailsConsent1) {
        tAndCConsent = formData.confirmDetailsConsent1;
      }
      if (formData && formData?.confirmDetailsConsent2) {
        detailsConsent = formData?.confirmDetailsConsent2;
      }
      digitalData.assisted.flag = bankUseToggle;
      digitalData.assisted.lg = lgCode;
      digitalData.assisted.lc = lcCode;
      digitalData.formDetails.TAndCConsent = tAndCConsent;
      digitalData.formDetails.detailsConsent = detailsConsent;
      break;
    }
    default:
    // do nothing
  }
}

/**
 * Send analytics events.
 * @param {string} eventType
 * @param {object} payload
 * @param {string} journeyState
 * @param {object} formData
 * @param {object} currentFormContext
 */
function sendAnalyticsEvent(eventType, payload, journeyState, formData) {
  const digitalData = createDeepCopyFromBlueprint(ANALYTICS_CLICK_OBJECT);
  const attributes = data[eventType];
  populateResponse(payload, eventType, digitalData, formData);
  sendSubmitClickEvent(formData?.login?.registeredMobileNumber, eventType, attributes?.linkType, formData, journeyState, digitalData);
}

/**
* sendErrorAnalytics
* @param {string} errorCode
* @param {string} errorMsg
* @param {string} journeyState
* @param {object} globals
*/
function sendErrorAnalytics(errorCode, errorMsg, journeyState, globals) {
  const digitalData = createDeepCopyFromBlueprint(ANALYTICS_PAGE_LOAD_OBJECT);
  setAnalyticPageLoadProps(journeyState, santizedFormDataWithContext(globals), digitalData);
  digitalData.page.pageInfo.errorCode = errorCode;
  digitalData.page.pageInfo.errorMessage = errorMsg;
  if (window) {
    window.digitalData = digitalData || {};
  }
  _satellite.track('pageload');
}

/**
* sendAnalytics
* @param {string} eventType
* @param {string} payload
* @param {string} journeyState
* @param {object} globals
*/
function sendAnalytics(eventType, payload, journeyState, globals) {
  const formData = santizedFormDataWithContext(globals);
  if (eventType.includes('page load')) {
    const pageName = eventType.split('-')[1];
    sendPageloadEvent(journeyState, formData, pageName);
  } else {
    sendAnalyticsEvent(eventType, payload, journeyState, formData);
  }
}

/**
 * Sends an analytics event and performs additional asynchronous operations.
 *
 * @param {string} eventType - The type of the event to be sent.
 * @param {string} payload - The data to be sent with the event.
 * @param {string} journeyState - The state of the current journey.
 * @param {Object} globals - Global context or data required for the event.
 * @returns {Promise<object>} A promise that resolves with 'Success' if the operation is successful, or rejects with an error.
 */
function asyncAnalytics(eventType, payload, journeyState, globals) {
  return new Promise((resolve) => {
    try {
      sendAnalyticsEvent(eventType, payload, journeyState, santizedFormDataWithContext(globals));
      setTimeout(() => resolve({ response: 'success' }), 2000);
    } catch (ex) {
      // no console.
    }
  });
}

export {
  sendPageloadEvent,
  sendAnalyticsEvent,
  sendErrorAnalytics,
  sendAnalytics,
  asyncAnalytics,
};