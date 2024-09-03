import { CURRENT_FORM_CONTEXT, FORM_RUNTIME } from '../../common/constants.js';
import { urlPath } from '../../common/formutils.js';
import { fetchJsonResponse } from '../../common/makeRestAPI.js';
import { FD_ENDPOINTS } from './constant.js';
// import { SELECTED_CUSTOMER_ID } from './customeridutil.js';

const createIpaRequest = (payload, globals) => {
  const ipaRequest = {
    requestString: {
      mobileNumber: globals.form.loginMainPanel.loginPanel.mobilePanel.registeredMobileNumber.$value,
      applRefNumber: payload.APS_APPL_REF_NUM,
      eRefNumber: CURRENT_FORM_CONTEXT.referenceNumber,
      // customerID: SELECTED_CUSTOMER_ID.selectedCustId.customerId,
      customerID: '50187305',
      journeyID: CURRENT_FORM_CONTEXT.journeyID,
      journeyName: CURRENT_FORM_CONTEXT.journeyName,
      productCode: 'ISBU',
    },
  };
  return ipaRequest;
};
/**
 * Executes an IPA request.
 * @name ipa
 * @param {object} payload - The payload for the IPA request.
 * @param {boolean} showLoader - Whether to show a loader while the request is in progress.
 * @param {boolean} hideLoader - Whether to hide the loader after the request is complete.
 * @param {object} globals - The global context object.
 * @returns {Promise<object>} A promise that resolves to the response of the IPA request.
 */
const ipa = (payload, showLoader, hideLoader, globals) => {
  const ipaRequest = createIpaRequest(payload, globals);
  const apiEndPoint = urlPath(FD_ENDPOINTS.ipa);
  if (showLoader) FORM_RUNTIME.ipa();
  return fetchJsonResponse(apiEndPoint, ipaRequest, 'POST', hideLoader);
};

/**
 *
 * @name ipaSuccessHandler
 * @param {object} response - The response recieved from the IPA request.
 * @param {object} globals - The global context object.
 * @returns {Promise<object>}
 */
const ipaSuccessHandler = (response, globals) => {
  console.log(response);
};

export {
  ipa,
  ipaSuccessHandler,
};
