import { CURRENT_FORM_CONTEXT } from './constants.js';
import { data } from './analyticsConstants.js';
/**
 * set analytics generic props for page load
 * @name setAnalyticPageLoadProps
 * @param {string} linkName - linkName
 * @param {string} linkType - linkType
 * @param {object} formContext - currentFormContext.
 * @param {string} formName - formName
 * @param {object} digitalData
 */

function setAnalyticPageLoadProps(journeyState, formData, digitalData, formName) {
  digitalData.user.pseudoID = '';// Need to check
  digitalData.user.journeyName = CURRENT_FORM_CONTEXT?.journeyName;
  digitalData.user.journeyID = formData?.journeyId;
  digitalData.user.journeyState = journeyState;
  digitalData.user.casa = '';
  digitalData.form.name = formName;
}

/**
 * set analytics generic props for click event
 * @name setAnalyticClickGenericProps
 * @param {string} linkName - linkName
 * @param {string} linkType - linkType
 * @param {object} formContext - currentFormContext.
 * @param {string} formName - formName
 * @param {object} digitalData
 */

function setAnalyticClickGenericProps(linkName, linkType, formData, journeyState, digitalData, formName) {
  digitalData.link = {
    linkName,
    linkType,
  };
  digitalData.link.linkPosition = data[linkName].linkPosition;
  digitalData.user.pseudoID = '';
  digitalData.user.journeyName = CURRENT_FORM_CONTEXT?.journeyName;
  digitalData.user.journeyID = CURRENT_FORM_CONTEXT?.journeyID;
  digitalData.user.journeyState = journeyState;
  if (linkName === 'otp click') {
    digitalData.form.name = formName;
    digitalData.user.casa = '';
  } else {
    digitalData.form.name = formData.etbFlowSelected === 'on' ? `${formName}-ETB` : `${formName}-NTB`;
    digitalData.user.casa = formData.etbFlowSelected === 'on' ? 'Yes' : 'No';
  }
  // window.digitalData = digitalData || {};
}

const getValidationMethod = (formContext) => {
  if (formContext && formContext?.login && formContext.login.panDobSelection) {
    return formContext.login.panDobSelection === '0' ? 'DOB' : 'PAN';
  }
  return '';
};

async function hashPhoneNumber(phoneNumber) {
  const encoder = new TextEncoder();
  const rawdata = encoder.encode(phoneNumber);
  const hash = await crypto.subtle.digest('SHA-256', rawdata);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export {
  setAnalyticClickGenericProps,
  setAnalyticPageLoadProps,
  getValidationMethod,
  hashPhoneNumber,
};
