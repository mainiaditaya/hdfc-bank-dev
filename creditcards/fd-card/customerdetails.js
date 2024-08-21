/* eslint-disable no-useless-escape */
import { CURRENT_FORM_CONTEXT } from '../../common/constants.js';
import { formUtil } from '../../common/formutils.js';
import { addDisableClass, validateTextInput, validateTextInputOnPaste } from '../domutils/domutils.js';
import { NAME_ON_CARD_LENGTH } from './constant.js';

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
  setFormValue(personalDetails.panNumber, customerInfo.pan);
  setFormValue(personalDetails.emailID, customerInfo.emailId);
  setFormValue(addressDetails.prefilledMailingAdddress, customerInfo.address);
  if (customerInfo.address.length === 0) {
    globals.functions.setProperty(addressDetails.mailingAddressToggle, { value: 'off', enabled: false });
  }
  if (customerInfo.customerFullName.length < 5) {
    setFormValue(personalDetails.nameOnCard, customerInfo.customerFullName);
  }

  const personaldetails = document.querySelector('.field-personaldetails');
  setTimeout(() => {
    addDisableClass(personaldetails);
  }, 10);
  const nameOnCardInput = document.querySelector('.field-nameoncard input');
  nameOnCardInput.addEventListener('input', () => validateTextInput(nameOnCardInput, /^[A-Za-z\s]+$/, NAME_ON_CARD_LENGTH));
  nameOnCardInput.addEventListener('input', () => validateTextInputOnPaste(nameOnCardInput, /^[A-Za-z\s]+$/));
};

/**
 *
 * @name validateNameOnCard
 * @param {Object} globals - The global context object containing various information.
 */
const validateNameOnCard = (globals) => {
  console.log(globals);
};

export {
  bindCustomerDetails,
  validateNameOnCard,
};
