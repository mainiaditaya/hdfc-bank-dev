import data from './analyticsConstants.js';
import * as CC_CONSTANT from '../creditcards/corporate-creditcard/constant.js';

const { JOURNEY_NAME } = CC_CONSTANT;
const digitalDataPageLoad = {
  page: {
    pageInfo: {
      pageName: JOURNEY_NAME,
      errorCode: '',
      errorMessage: '',
    },
  },
  user: {
    pseudoID: 'TBD',
    journeyID: '',
    journeyName: JOURNEY_NAME,
    journeyState: '',
    casa: '',
  },
  form: {
    name: 'Corporate credit card',
  },
};

/**
 * send analytics call for click event
 * @name sendGenericEvent
 * @param {string} linkName - linkName
 * @param {string} linkType - linkName
 * @param {object} formContext - currentFormContext.
 * @param {object} digitalData
 */

function sendGenericClickEvent(linkName, linkType, formContext, digitalData) {
  const digitalDataEvent = digitalData || {};
  digitalDataEvent.link = {
    linkName,
    linkType,
  };
  digitalDataEvent.user.journeyID = formContext?.currentFormContext?.journeyID;
  digitalDataEvent.user.journeyState = formContext?.currentFormContext?.journeyState;
  digitalDataEvent.event = {};
  window.digitalData = digitalDataEvent || {};
  // eslint-disable-next-line no-undef
  _satellite.track('event');
}

const getValidationMethod = (formContext) => {
  if (formContext && formContext?.login && formContext.login.panDobSelection) {
    return formContext.login.panDobSelection === '0' ? 'DOB' : 'PAN';
  }
  return '';
};

/**
 *Creates digital data for otp click event.
 * @param {string} phone
 * @param {string} validationType
 * @param {string} linkName
 * @param {object} formContext
 * @param {object} digitalData
 */
function sendSubmitClickEvent(phone, linkName, linkType, formContext, currentFormContext, digitalData) {
  const digitalDataEvent = digitalData || {
    page: {
      pageInfo: {
        pageName: JOURNEY_NAME,
        errorCode: '',
        errorMessage: '',
      },
    },
    user: {
      pseudoID: 'TBD',
      journeyID: '',
      journeyName: JOURNEY_NAME,
      journeyState: '',
      casa: '',
      gender: '',
      email: '',
    },
    form: {
      name: 'Corporate credit card',
    },
    link: {
      linkName: '',
      linkType: '',
      linkPosition: 'form',
    },
    event: {
      phone: '',
      validationMethod: '',
      status: '',
      rating: '',
    },
    formDetails: {
      employmentType: '',
      companyName: '',
      designation: '',
      relationshipNumber: '',
      pincode: '',
      city: '',
      state: '',
      KYCVerificationMethod: '',
      languageSelected: '',
      reference: '',
      isVideoKYC: '',
    },
    card: {
      selectedCard: '',
      eligibleCard: '',
      annualFee: '',
    },
  };
  sendGenericClickEvent(linkName, linkType, currentFormContext, digitalDataEvent);
  digitalDataEvent.event = {
    phone,
    validationMethod: getValidationMethod(formContext),
  };
  digitalDataEvent.formDetails = {

  };
  window.digitalData = digitalDataEvent || {};
  // eslint-disable-next-line no-undef
  _satellite.track('submit');
}

/**
 * Sends analytics event on page load.
 * @name sendPageloadEvent
 * @param {object} formContext.
 */
function sendPageloadEvent(formContext) {
  digitalDataPageLoad.user.journeyID = formContext.journeyID;
  digitalDataPageLoad.user.journeyState = formContext?.journeyState || 'CUSTOMER_IDENTITY_UNRESOLVED';
  digitalDataPageLoad.user['Journey Name'] = JOURNEY_NAME;
  if (window) {
    window.digitalData = digitalDataPageLoad || {};
  }
  // eslint-disable-next-line no-undef
  _satellite.track('pageload');
}

function populateResponse(payload, action, digitalDataEvent) {
  switch (action) {
    case 'getOTP': {
      digitalDataEvent.page.pageInfo.errorCode = payload?.status?.errorCode;
      digitalDataEvent.page.pageInfo.errorMessage = payload?.status?.errorMsg;
      break;
    }
    default: {
      /* empty */
    }
  }
}

/**
 * Send analytics events.
 * @param {object} payload
 * @param {object} formData
 */
function sendAnalyticsEvent(payload, formData, currentFormContext) {
  const digitalDataEvent = {
    page: {
      pageInfo: {
        pageName: JOURNEY_NAME,
        errorCode: '',
        errorMessage: '',
      },
    },
    user: {
      pseudoID: 'TBD',
      journeyID: '',
      journeyName: JOURNEY_NAME,
      journeyState: '',
      casa: '',
      gender: '',
      email: '',
    },
    form: {
      name: 'Corporate credit card',
    },
    link: {
      linkName: '',
      linkType: '',
      linkPosition: 'form',
    },
    event: {
      phone: '',
      validationMethod: '',
      status: '',
      rating: '',
    },
    formDetails: {
      employmentType: '',
      companyName: '',
      designation: '',
      relationshipNumber: '',
      pincode: '',
      city: '',
      state: '',
      KYCVerificationMethod: '',
      languageSelected: '',
      reference: '',
      isVideoKYC: '',
    },
    card: {
      selectedCard: '',
      eligibleCard: '',
      annualFee: '',
    },
  };
  const apiResponse = JSON.parse(payload || {});
  const action = currentFormContext?.action;
  const attributes = data[action];
  populateResponse(apiResponse, action, digitalDataEvent);
  sendSubmitClickEvent(formData?.login?.registeredMobileNumber, action, attributes?.linkType, formData, currentFormContext, digitalDataEvent);
}

export {
  digitalDataPageLoad,
  sendPageloadEvent,
  sendSubmitClickEvent,
  sendGenericClickEvent,
  sendAnalyticsEvent,
};
