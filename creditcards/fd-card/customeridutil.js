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
 * Fetches the customer ID
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

const setCustIdPanelValue = async (globals, customerData, panel) => {
  await globals.functions.setProperty(panel.maskedAccNo, { value: customerData.customerId });
  await globals.functions.setProperty(panel.noofFDs, { value: customerData.eligibleFDCount });
};

const waitForPanelReady = async () => new Promise((resolve) => setTimeout(resolve, 200));

const updateData = async (globals, customerData) => {
  for (let i = 0; i < customerData.length; i += 1) {
    const panel = globals.form.multipleCustIDPanel.multipleCustIDSelectionPanel.multipleCustIDRepeatable[i];

    await setCustIdPanelValue(globals, customerData[i], panel);
    await waitForPanelReady();
  }
};

const customerIdSuccessHandler = async (payload, globals) => {
  const customerData = payload?.customerAccountDetailsDTO;
  if (!customerData?.length) return;

  const basePanel = globals.form.multipleCustIDPanel.multipleCustIDSelectionPanel.multipleCustIDRepeatable;

  for (let i = 0; i < customerData.length; i += 1) {
    if (i !== 0) {
      await globals.functions.dispatchEvent(basePanel, 'addItem');
      await waitForPanelReady();
    }
  }
  updateData(globals, customerData);
};

/**
 * Handles on select of customer ID radio button.
 * @name customerIdClickHandler
 * @param {Object} globals
 */
const customerIdClickHandler = (globals) => {
  console.log(globals);
};

export {
  fetchCustomerId,
  customerIdSuccessHandler,
  customerIdClickHandler,
};
