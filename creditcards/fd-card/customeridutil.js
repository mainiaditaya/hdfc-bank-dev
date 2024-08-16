import { CURRENT_FORM_CONTEXT } from '../../common/constants.js';
import { FD_ENDPOINTS } from './constant.js';
import { fetchJsonResponse } from '../../common/makeRestAPI.js';
import { urlPath } from '../../common/formutils.js';

const custmerIdPayload = (mobileNumber, panNumber, dateOfBirth) => {
  const payload = {
    requestString: {
      mobileNumber,
      dateOfBirth: dateOfBirth || '',
      panNumber: panNumber ? panNumber.replace(/\s+/g, '') : '',
      journeyID: CURRENT_FORM_CONTEXT.journeyID,
      journeyName: CURRENT_FORM_CONTEXT.journeyName,
    },
  };
  return payload;
};

/**
 * Fetches the customer ID based on the provided global variables.
 *
 * @param {string} mobileNumber
 * @param {string} pan
 * @param {string} dob
 * @param {Object} globals
 * @returns {Promise<Object>} A promise that resolves to the JSON response of the customer account details.
 */
const fetchCustomerId = (mobileNumber, pan, dob, globals) => {
  const payload = custmerIdPayload(mobileNumber, pan, dob, globals);
  return fetchJsonResponse(urlPath(FD_ENDPOINTS.customeraccountdetailsdto), payload, 'POST');
};

const customerIdSuccessHandler = (globals) => {
  console.log(globals);
};

export {
  fetchCustomerId,
  customerIdSuccessHandler,
};
