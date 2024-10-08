/* eslint no-bitwise: ["error", { "allow": ["^", ">>", "&"] }] */

import {
  santizedFormDataWithContext,
  urlPath,
  generateUUID,
} from '../../common/formutils.js';
import { fetchJsonResponse } from '../../common/makeRestAPI.js';
import * as NRE_CONSTANT from './constant.js';

import * as CONSTANT from '../../common/constants.js';

const { ENDPOINTS, CURRENT_FORM_CONTEXT: currentFormContext } = CONSTANT;
const { CHANNEL, JOURNEY_NAME, VISIT_MODE } = NRE_CONSTANT;

/**
     * generates the journeyId
     * @param {string} visitMode - The visit mode (e.g., "online", "offline").
     * @param {string} journeyAbbreviation - The abbreviation for the journey.
     * @param {string} channel - The channel through which the journey is initiated.
     * @param {object} globals
     */
function createJourneyId(visitMode, journeyAbbreviation, channel, globals) {
  const dynamicUUID = generateUUID();
  // var dispInstance = getDispatcherInstance();
  const journeyId = globals.functions.exportData().journeyId || `${dynamicUUID}_01_${journeyAbbreviation}_${visitMode}_${channel}`;
  globals.functions.setProperty(globals.form.runtime.journeyId, { value: journeyId });
  return journeyId;
}

const getCurrentContext = () => currentFormContext;

/**
     * @name invokeJourneyDropOff to log on success and error call backs of api calls
     * @param {state} state
     * @param {string} mobileNumber
     * @param {Object} globals - globals variables object containing form configurations.
     * @return {PROMISE}
     */
const invokeJourneyDropOff = async (state, mobileNumber, globals) => {
  const DEFAULT_MOBILENO = '9999999999';
  const journeyJSONObj = {
    RequestPayload: {
      userAgent: (typeof window !== 'undefined') ? window.navigator.userAgent : 'onLoad',
      leadProfile: {
        mobileNumber: mobileNumber || DEFAULT_MOBILENO,
      },
      formData: {
        channel: CHANNEL,
        journeyName: globals.form.runtime.journeyName.$value,
        journeyID: globals.form.runtime.journeyId.$value || createJourneyId(VISIT_MODE, JOURNEY_NAME, CHANNEL, globals),
        journeyStateInfo: [
          {
            state,
            stateInfo: JSON.stringify(santizedFormDataWithContext(globals)),
            timeinfo: new Date().toISOString(),
          },
        ],
      },
    },
  };
  const url = urlPath(ENDPOINTS.journeyDropOff);
  const method = 'POST';
  // return globals.functions.exportData().queryParams.leadId ? fetchJsonResponse(url, journeyJSONObj, method) : null;
  return journeyJSONObj.RequestPayload.formData.journeyID ? fetchJsonResponse(url, journeyJSONObj, method) : null;
};

/**
     * @name invokeJourneyDropOffUpdate
     * @param {string} state
     * @param {string} mobileNumber
     * @param {string} leadProfileId
     * @param {string} journeyId
     * @param {Object} globals - globals variables object containing form configurations.
     * @return {PROMISE}
     */
const invokeJourneyDropOffUpdate = async (state, mobileNumber, leadProfileId, journeyId, globals) => {
  // temporary_hotfix_radioBtnValues_undefined_issue
  /* storing the radio btn values in current form context */
  if ((state === 'IDCOM_REDIRECTION_INITIATED') || (state === 'CUSTOMER_AADHAR_INIT')) {
    const { form } = globals.functions.exportData();
    const { selectKYCMethodOption1: { aadharEKYCVerification }, selectKYCMethodOption2: { aadharBiometricVerification }, selectKYCMethodOption3: { officiallyValidDocumentsMethod } } = globals.form.corporateCardWizardView.selectKycPanel.selectKYCOptionsPanel;
    // ETB OVD
    // NTB OVD
    // ETB NO ADRRESS CHANGE
    /* ovd (ETB + NTB) & ETB address no change cases the cardDeliveryAddressCase1 expression otherwise cardDeliveryAddressCase2 */
    const cardDeliveryAddressCase1 = {
      cardDeliveryAddressOption1: globals.form.corporateCardWizardView.confirmAndSubmitPanel.addressDeclarationPanel.addressDeclarationOVD.currentAddressOVD.currentAddressOVDOption.$value,
      cardDeliveryAddressOption2: globals.form.corporateCardWizardView.confirmAndSubmitPanel.addressDeclarationPanel.addressDeclarationOVD.officeAddressOVD.officeAddressOVDOption.$value,
    };

    const cardDeliveryAddressCase2 = {
      cardDeliveryAddressOption1: globals.form.corporateCardWizardView.confirmAndSubmitPanel.addressDeclarationPanel.cardDeliveryAddressPanel.cardDeliveryAddressOption1.$value,
      cardDeliveryAddressOption2: globals.form.corporateCardWizardView.confirmAndSubmitPanel.addressDeclarationPanel.cardDeliveryAddressPanel.cardDeliveryAddressOption2.$value,
    };
    const formContextCallbackData = globals.functions.exportData()?.currentFormContext || currentFormContext;
    const journeyType = formContextCallbackData?.executeInterfaceReqObj?.requestString?.journeyFlag;
    const biometricStatus = ((aadharBiometricVerification.$value || form.aadharBiometricVerification) && 'bioKyc') || ((aadharEKYCVerification.$value || form.aadharEKYCVerification) && 'aadhaar') || ((officiallyValidDocumentsMethod.$value || form.officiallyValidDocumentsMethod) && 'OVD');
    const etbAddressChange = formContextCallbackData?.executeInterfaceReqObj?.requestString?.addressEditFlag;
    const ovdNtbEtbAddressNoChange = ((journeyType === 'ETB') && etbAddressChange === 'N') || ((journeyType === 'ETB') && biometricStatus === 'OVD') || ((journeyType === 'NTB' && biometricStatus === 'OVD'));
    const deliveryPanelAddress = ovdNtbEtbAddressNoChange ? cardDeliveryAddressCase1 : cardDeliveryAddressCase2;

    currentFormContext.radioBtnValues = {
      kycMethod: {
        aadharBiometricVerification: aadharBiometricVerification.$value || form.aadharBiometricVerification,
        aadharEKYCVerification: aadharEKYCVerification.$value || form.aadharEKYCVerification,
        officiallyValidDocumentsMethod: officiallyValidDocumentsMethod.$value || form.officiallyValidDocumentsMethod,
      },
      deliveryAddress: deliveryPanelAddress,
    };
  }
  const sanitizedFormData = santizedFormDataWithContext(globals, currentFormContext);
  const journeyJSONObj = {
    RequestPayload: {
      userAgent: (typeof window !== 'undefined') ? window.navigator.userAgent : '',
      leadProfile: {
        mobileNumber,
        leadProfileId: leadProfileId?.toString(),
      },
      formData: {
        channel: CHANNEL,
        journeyName: globals.form.runtime.journeyName.$value,
        journeyID: journeyId,
        journeyStateInfo: [
          {
            state,
            stateInfo: JSON.stringify(sanitizedFormData),
            timeinfo: new Date().toISOString(),
          },
        ],
      },
    },
  };
    // sendSubmitClickEvent(mobileNumber, linkName, sanitizedFormData);
  const url = urlPath(ENDPOINTS.journeyDropOffUpdate);
  const method = 'POST';
  return fetchJsonResponse(url, journeyJSONObj, method);
};

/**
     * @name printPayload
     * @param {string} payload.
     * @param {object} formContext.
     * @returns {object} currentFormContext.
     */
function journeyResponseHandlerUtil(payload, formContext) {
  formContext.leadProfile = {};
  formContext.leadProfile.leadProfileId = String(payload);
  return formContext;
}

/**
    * @name invokeJourneyDropOffByParam
    * @param {string} mobileNumber
    * @param {string} leadProfileId
    * @param {string} journeyId
    * @return {PROMISE}
    */
const invokeJourneyDropOffByParam = async (mobileNumber, leadProfileId, journeyID) => {
  const journeyJSONObj = {
    RequestPayload: {
      leadProfile: {
        mobileNumber,
      },
      journeyInfo: {
        journeyID,
      },
    },
  };
  const url = urlPath(ENDPOINTS.journeyDropOffParam);
  const method = 'POST';
  return fetchJsonResponse(url, journeyJSONObj, method);
};

export {
  invokeJourneyDropOff,
  invokeJourneyDropOffUpdate,
  getCurrentContext,
  createJourneyId,
  journeyResponseHandlerUtil,
  invokeJourneyDropOffByParam,
};
