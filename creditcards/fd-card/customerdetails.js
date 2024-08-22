/* eslint-disable no-useless-escape */
import { CURRENT_FORM_CONTEXT } from '../../common/constants.js';
import { formUtil, urlPath } from '../../common/formutils.js';
import { getJsonResponse } from '../../common/makeRestAPI.js';
import { addDisableClass } from '../domutils/domutils.js';
import { FD_ENDPOINTS } from './constant.js';

/**
 * Binds customer details from the global context to the current form.
 * @name bindCustomerDetails
 * @param {Object} globals - The global context object containing various information.
 */
const bindCustomerDetails = (globals) => {
  const { customerInfo } = CURRENT_FORM_CONTEXT;
  const changeDataAttrObj = { attrChange: true, value: false, disable: true };
  const genderMap = { Male: '0', Female: '1', Others: '3' };
  const { reviewDetailsView } = globals.form.fdBasedCreditCardWizard.basicDetails;
  const { personalDetails, addressDetails } = reviewDetailsView;

  const setFormValue = (field, value) => {
    const fieldUtil = formUtil(globals, field);
    fieldUtil.setValue(value, changeDataAttrObj);
  };

  setFormValue(personalDetails.fullName, customerInfo.customerFullName);
  setFormValue(personalDetails.gender, genderMap[customerInfo.gender]);
  setFormValue(personalDetails.dateOfBirth, customerInfo.dob);
  // setFormValue(personalDetails.panNumber, customerInfo.pan);
  // setFormValue(personalDetails.emailID, customerInfo.emailId);
  // setFormValue(addressDetails.prefilledMailingAdddress, customerInfo.address);
  setFormValue(personalDetails.panNumber, '');
  setFormValue(personalDetails.emailID, '');
  setFormValue(addressDetails.prefilledMailingAdddress, '');
  if (customerInfo.address.length === 0 || true) {
    globals.functions.setProperty(addressDetails.prefilledMailingAdddress, { visible: false });
    globals.functions.setProperty(addressDetails.mailingAddressToggle, { value: 'off', enabled: false });
  }
  if (customerInfo.customerFullName.length < 5) {
    setFormValue(personalDetails.nameOnCard, customerInfo.customerFullName);
  }

  const personaldetails = document.querySelector('.field-personaldetails');
  setTimeout(() => {
    addDisableClass(personaldetails);
  }, 10);
};

/**
 *
 * @name validateNameOnCard
 * @param {Object} globals - The global context object containing various information.
 */
const validateNameOnCard = (globals) => {
  console.log(globals);
};

const validateEmailID = async (email, globals) => {
  const url = urlPath(FD_ENDPOINTS.emailId);
  const invalidMsg = 'Please enter valid email id...';
  const payload = {
    email,
  };
  const method = 'POST';
  try {
    const emailValid = await getJsonResponse(url, payload, method);
    if (emailValid === true) {
      globals.functions.setProperty(globals.form.corporateCardWizardView.yourDetailsPanel.yourDetailsPage.personalDetails.personalEmailAddress, { valid: true });
    } else {
      globals.functions.markFieldAsInvalid('$form.corporateCardWizardView.yourDetailsPanel.yourDetailsPage.personalDetails.personalEmailAddress', invalidMsg, { useQualifiedName: true });
    }
  } catch (error) {
    console.error(error, 'error in emailValid');
  }
};

export {
  bindCustomerDetails,
  validateNameOnCard,
  validateEmailID,
};
