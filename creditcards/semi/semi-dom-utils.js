import {
  validatePhoneNumber,
  validateCardDigits,
  validateOTPInput,
} from '../domutils/domutils.js';

/**
 * Function validates the Mobile Input Field
 *
 */
const addMobileValidation = async () => {
  const validFirstDigits = ['6', '7', '8', '9'];
  const inputField = document.querySelector('.field-aem-mobilenum input');
  inputField?.addEventListener('input', () => validatePhoneNumber(inputField, validFirstDigits));
};

/**
   * Function validates the Card Last 4 digits Input Field
   *
   */
const addCardFieldValidation = () => {
  const inputField = document.querySelector('.field-aem-cardno input');
  inputField?.addEventListener('input', () => validateCardDigits(inputField));
};

/**
  * Function validates the OTP Input Field
  *
  */
const addOtpFieldValidation = () => {
  const inputField = document.querySelector('.field-aem-otpnumber input');
  const inputField2 = document.querySelector('.field-aem-otpnumber2 input');
  [inputField, inputField2].forEach((ip) => ip?.addEventListener('input', () => validateOTPInput(ip)));
};

export {
  addMobileValidation,
  addCardFieldValidation,
  addOtpFieldValidation,
};
