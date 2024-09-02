import {
  validatePhoneNumber,
  validateCardDigits,
  validateOTPInput,
} from '../domutils/domutils.js';

/**
 * Function validates the Mobile Input Field
 *
 */
const addMobileValidation = () => {
  const validFirstDigits = ['6', '7', '8', '9'];
  const inputField = document.querySelector('.field-aem-mobilenum input');
  inputField.addEventListener('input', () => validatePhoneNumber(inputField, validFirstDigits));
};

/**
     * Function validates the Card Last 4 digits Input Field
     *
     */
const addCardFieldValidation = () => {
  const inputField = document.querySelector('.field-aem-cardno input');
  inputField.addEventListener('input', () => validateCardDigits(inputField));
};

/**
    * Function validates the OTP Input Field
    *
    */
const addOtpFieldValidation = () => {
  const inputField = document.querySelector('.field-aem-otpnumber input');
  inputField.addEventListener('input', () => validateOTPInput(inputField));
};

setTimeout(() => {
  addMobileValidation();
  addCardFieldValidation();
  addOtpFieldValidation();
}, 1500);

export {
  addMobileValidation,
  addCardFieldValidation,
  addOtpFieldValidation,

};
