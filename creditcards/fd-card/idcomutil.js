import { CURRENT_FORM_CONTEXT, ENDPOINTS } from '../../common/constants.js';
import { urlPath } from '../../common/formutils.js';
import { fetchJsonResponse } from '../../common/makeRestAPI.js';

/**
 * Creates an IdCom request object based on the provided global data.
 * @param {Object} globals - The global object containing necessary data for IdCom request.
 * @returns {Object} - The IdCom request object.
 */
const createIdComRequestObj = (globals) => {
  const { addressDetails, personalDetails } = globals.form.fdBasedCreditCardWizard.basicDetails.reviewDetailsView;
  const scope = addressDetails.mailingAddressToggle._data.$_value === 'on' ? 'AACC' : 'ADOBE_PACC';
  const idComObj = {
    requestString: {
      mobileNumber: globals.form.loginMainPanel.loginPanel.mobilePanel.registeredMobileNumber._data.$_value,
      ProductCode: 'CORPCC' || CURRENT_FORM_CONTEXT.selectedProductCode,
      PANNo: personalDetails.panNumberPersonalDetails._data.$_value.replace(/\s+/g, ''),
      userAgent: navigator.userAgent,
      journeyID: CURRENT_FORM_CONTEXT.journeyID,
      journeyName: CURRENT_FORM_CONTEXT.journeyName,
      scope,
    },
  };
  return idComObj;
};

/**
 * Fetches an authentication code from the API.
 *
 * This function creates an idcomm request object, constructs the API endpoint URL,
 * and then sends a POST request to the endpoint to fetch the authentication code.
 * @name idcomm
 * @params {object} globals
 * @returns {Promise<Object>} A promise that resolves to the JSON response from the API.
 */
const idcomm = async (globals) => {
  const idComRequest = createIdComRequestObj(globals);
  const apiEndPoint = urlPath(ENDPOINTS.fetchAuthCode);
  return fetchJsonResponse(apiEndPoint, idComRequest, 'POST');
  // const response = await fetchJsonResponse(apiEndPoint, idComRequest, 'POST');
  // console.log(response);
  // window.location.href = response.redirectUrl;
};

const idcomSuccessHandler = async (authCode, redirectUrl) => new Promise((resolve) => {
  setTimeout(() => {
    CURRENT_FORM_CONTEXT.authCode = authCode;
    CURRENT_FORM_CONTEXT.ID_COM_URL = redirectUrl;
    resolve({ success: 'true' });
  }, 100);
});

export {
  idcomm,
  idcomSuccessHandler,
};
