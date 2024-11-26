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
  digitalData.user.pseudoID = 'NA';// Need to check
  digitalData.user.journeyName = currentFormContext?.journeyName;
  digitalData.user.journeyID = formData?.journeyId;
  digitalData.user.journeyState = journeyState;
  digitalData.user.casa = 'NA';
  digitalData.form.name = FORM_NAME;
}

/**
 * set analytics generic props for click event
 * @name setAnalyticClickGenericProps
 * @param {string} linkName - linkName
 * @param {string} linkType - linkName
 * @param {object} formContext - currentFormContext.
 * @param {object} digitalData
 */

function setAnalyticClickGenericProps(linkName, linkType, formData, journeyState, digitalData) {
  digitalData.link = {
    linkName,
    linkType,
  };
  digitalData.link.linkPosition = data[linkName].linkPosition;
  digitalData.user.pseudoID = 'NA';
  digitalData.user.journeyName = currentFormContext?.journeyName;
  digitalData.user.journeyID = currentFormContext?.journeyID;
  digitalData.user.journeyState = journeyState;
  digitalData.form.name = FORM_NAME;
  digitalData.user.casa = 'NA';
}

function getValidationMethod(formContext) {
  return formContext?.form?.login?.panDobSelection === '0' ? 'DOB' : 'PAN';
}

/**
 * Sends analytics event on page load.
 * @name sendPageloadEvent
 * @param {string} journeyState.
 * @param {object} formData.
 * @param {string} pageName.
 * @param {string} errorAPI.
 */
function sendPageloadEvent(journeyState, formData, pageName, errorAPI, errorMessage, errorCode) {
  const digitalData = createDeepCopyFromBlueprint(ANALYTICS_PAGE_LOAD_OBJECT);
  digitalData.page.pageInfo.pageName = pageName;
  digitalData.page.pageInfo.errorAPI = errorAPI;
  digitalData.page.pageInfo.errorCode = errorCode;
  digitalData.page.pageInfo.errorMessage = errorMessage;
  // digitalData.page.event.status = eventStatus;
  setAnalyticPageLoadProps(journeyState, formData, digitalData);
  switch (pageName) {
    case 'Step 3 : Select  Account': {
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
    case 'select account type': {
      digitalData.formDetails.bankBranch = currentFormContext?.fatca_response?.customerAccountDetailsDTO[currentFormContext.selectedCheckedValue]?.branchName ?? 'NA';
      digitalData.formDetails.existingAccountType = currentFormContext?.existingAccountType ?? 'NA';
      digitalData.formDetails.accountType = currentFormContext.productAccountName ?? 'NA';

      break;
    }
    case 'Step 4 : Confirm Details': {
      digitalData.formDetails.city = currentFormContext?.fatca_response?.namCustadrCity ?? 'NA';
      digitalData.formDetails.state = currentFormContext?.fatca_response?.namCustadrState ?? 'NA';
      digitalData.formDetails.pincode = currentFormContext?.fatca_response?.txtCustadrZip ?? 'NA';
      digitalData.formDetails.nationality = formData?.form?.confirmDetails?.countryOfBirth ?? 'NA';
      digitalData.formDetails.countryTaxResidence = formData?.form?.confirmDetails?.countryTaxResidence ?? 'NA';
      digitalData.formDetails.countryofBirth = formData?.form?.confirmDetails?.countryOfBirth ?? 'NA';
      digitalData.formDetails.nomineeRelation = formData?.form?.confirmDetails?.nomineeDetails?.relation ?? 'NA';
      digitalData.formDetails.companyName = formData?.form?.confirmDetails?.financialDetails?.employeerName ?? 'NA';
      digitalData.formDetails.AnnualIncome = formData?.form?.confirmDetails?.financialDetails?.grossAnnualIncome ?? 'NA';
      digitalData.formDetails.currency = formData?.form?.confirmDetails?.financialDetails?.currencyName ?? 'NA';
      digitalData.formDetails.residenceType = formData?.form?.confirmDetails?.financialDetails?.residenceType ?? 'NA';
      digitalData.formDetails.sourceoffunds = formData?.form?.confirmDetails?.financialDetails?.sourceOfFunds ?? 'NA';
      digitalData.formDetails.selfemployeddate = formData?.form?.confirmDetails?.financialDetails?.selfEmployedSince ?? 'NA';
      digitalData.formDetails.natureofbusiness = formData?.form?.confirmDetails?.financialDetails?.natureOfBusiness ?? 'NA';
      digitalData.formDetails.typeofcompany = formData?.form?.confirmDetails?.financialDetails?.typeOfCompoanyFirm ?? 'NA';
      digitalData.formDetails.typeofprofessional = formData?.form?.confirmDetails?.financialDetails?.selfEmployedProfessional ?? 'NA';
    }
    case 'Step 5 : Confirmation': {
      digitalData.formDetails.accountType;
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
      setTimeout(() => {
        sendPageloadEvent(journeyState, formData, PAGE_NAME.nrenro['select account']);
      }, 1000);
      break;
    }
    case 'continue btn select account': {
      if (window) {
        window.digitalData = digitalData || {};
      }
      _satellite.track('submit');

      setTimeout(() => {
        sendPageloadEvent(journeyState, formData, PAGE_NAME.nrenro['select account type']);
      }, 1000);
      break;
    }
    case 'select account type click': {
      if (window) {
        window.digitalData = digitalData || {};
      }
      _satellite.track('submit');

      setTimeout(() => {
        sendPageloadEvent(journeyState, formData, PAGE_NAME.nrenro['confirm details']);
      }, 1000);
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
      let privacyConsent = 'NA';
      let callSmsWhatsappConsent = 'NA';
      let countryCode = 'NA';
      // Check for privacy consent
      // if (formData && formData?.form && formData.form?.consent && formData.form.consent?.checkboxConsent1Label) {
      privacyConsent = formData?.form?.consent?.checkboxConsent1Label ?? 'NA';
      // }
      // if (formData && formData?.form && formData.form?.consent && formData.form.consent?.checkboxConsent2Label) {
      callSmsWhatsappConsent = formData?.form?.consent?.checkboxConsent2Label ?? 'NA';
      // }
      // if (formData && formData?.form && formData.form?.consent && formData.form.login?.countryCode) {
      countryCode = formData?.form?.login?.countryCode ?? 'NA';
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
      digitalData.event.status = '1';
      break;
    }
    case 'continue btn select account': {
      digitalData.formDetails.existingAccountType = currentFormContext?.existingAccountType ?? 'NA';
      digitalData.formDetails.bankBranch = currentFormContext?.fatca_response?.customerAccountDetailsDTO[currentFormContext.selectedCheckedValue]?.branchName ?? 'NA';
      break;
    }
    case 'select account type click': {
      digitalData.formDetails.accountType = currentFormContext.productAccountName ?? 'NA';
      digitalData.formDetails.bankBranch = currentFormContext?.fatca_response?.customerAccountDetailsDTO[currentFormContext.selectedCheckedValue]?.branchName ?? 'NA';
      digitalData.formDetails.existingAccountType = currentFormContext?.existingAccountType ?? 'NA';
      break;
    }
    case 'confirm details click': {
      digitalData.assisted.flag = 'NA';
      digitalData.assisted.lg = 'NA';
      digitalData.assisted.lc = 'NA';
      digitalData.formDetails.TAndCConsent = formData?.needBankHelp?.confirmDetailsConsent1 ?? 'NA';
      digitalData.formDetails.detailsConsent = formData?.needBankHelp?.confirmDetailsConsent2 ?? 'NA';
      break;
    }
    case 'idcom redirection check': {
      digitalData.event.validationMethod = payload?.validationMethod ?? 'NA';
      digitalData.event.status = payload?.status ?? 'NA';
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
    const errorAPI = formData?.AccountOpeningNRENRO?.apiDetails?.APIName ?? 'NA';
    const errorMessage = formData?.AccountOpeningNRENRO?.apiDetails?.errorMessage ?? 'NA';
    const errorCode = formData?.AccountOpeningNRENRO?.apiDetails?.errorCode ?? 'NA';
    // const eventStatus = formData?.AccountOpeningNRENRO?.apiDetails?.status;
    sendPageloadEvent(journeyState, formData, pageName, errorAPI, errorMessage, errorCode);
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
