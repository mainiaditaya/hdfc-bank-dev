/* eslint-disable no-underscore-dangle */
/* eslint-disable no-useless-escape */
import { CURRENT_FORM_CONTEXT, FORM_RUNTIME as formRuntime } from '../../common/constants.js';
import { formUtil, urlPath } from '../../common/formutils.js';
import { getJsonResponse, displayLoader } from '../../common/makeRestAPI.js';
import { addDisableClass } from '../domutils/domutils.js';
import { FD_ENDPOINTS, NAME_ON_CARD_LENGTH } from './constant.js';

/**
 * Binds customer details from the global context to the current form.
 * @name bindCustomerDetails
 * @param {Object} globals - The global context object containing various information.
 */
const bindCustomerDetails = (globals) => {
  formRuntime.validatePanLoader = (typeof window !== 'undefined') ? displayLoader : false;
  const { customerInfo } = CURRENT_FORM_CONTEXT;
  const changeDataAttrObj = { attrChange: true, value: false, disable: true };
  const genderMap = { Male: '0', Female: '1', Others: '3' };
  const { reviewDetailsView } = globals.form.fdBasedCreditCardWizard.basicDetails;
  const { personalDetails, addressDetails } = reviewDetailsView;

  const setFormValue = (field, value) => {
    const fieldUtil = formUtil(globals, field);
    fieldUtil.setValue(value, changeDataAttrObj);
  };
  customerInfo.customerFullName = 'FirstName MiddleName LastName';
  setFormValue(personalDetails.fullName, customerInfo.customerFullName);
  setFormValue(personalDetails.gender, genderMap[customerInfo.gender]);
  setFormValue(personalDetails.dateOfBirthPersonalDetails, customerInfo.dob);
  setFormValue(personalDetails.panNumberPersonalDetails, customerInfo.pan);
  setFormValue(personalDetails.emailID, customerInfo.emailId);
  setFormValue(addressDetails.prefilledMailingAdddress, customerInfo.address);
  // setFormValue(personalDetails.fullName, '');
  // setFormValue(personalDetails.panNumberPersonalDetails, '');
  // setFormValue(personalDetails.emailID, '');
  // setFormValue(addressDetails.prefilledMailingAdddress, '');
  if (customerInfo.address.length === 0) {
    globals.functions.setProperty(addressDetails.prefilledMailingAdddress, { visible: false });
    globals.functions.setProperty(addressDetails.mailingAddressToggle, { value: 'off', enabled: false });
  }
  if (customerInfo.customerFullName.length < NAME_ON_CARD_LENGTH) {
    setFormValue(personalDetails.nameOnCard, customerInfo.customerFullName);
  } else {
    globals.functions.setProperty(personalDetails.nameOnCard, { visible: false });
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

const setVisibility = (panel, properties, visibility, globals) => {
  properties.forEach((property) => {
    globals.functions.setProperty(panel[property], { visible: visibility });
  });
};

/**
 *
 * @name channelChangeHandler
 * @param {Object} globals - The global context object containing various information.
 */
const channelChangeHandler = (globals) => {
  const { employeeAssistancePanel } = globals.form.fdBasedCreditCardWizard.basicDetails.reviewDetailsView.employeeAssistance;
  const channelValue = employeeAssistancePanel.channel._data.$_value;

  const visibilitySettings = {
    0: ['branchCity', 'branchCode', 'branchName', 'cardsBdrLc1', 'tseLgCode', 'dsaCode', 'dsaName', 'lc1Code', 'lc2Code', 'lgCode', 'smCode'],
    1: ['dsaCode', 'dsaName', 'lc1Code', 'lgCode'],
    21: ['branchCity', 'branchCode', 'branchName', 'tseLgCode', 'cardsBdrLc1'],
    default: ['branchCity', 'branchCode', 'branchName', 'cardsBdrLc1', 'tseLgCode', 'dsaCode', 'dsaName'],
  };

  const propertiesToHide = visibilitySettings[channelValue] || visibilitySettings.default;
  setVisibility(employeeAssistancePanel, propertiesToHide, false, globals);
};

export {
  bindCustomerDetails,
  validateNameOnCard,
  validateEmailID,
  channelChangeHandler,
};
