import {
  groupCharacters,
  validatePhoneNumber,
  validatePanInput,
} from '../domutils/domutils.js';

/**
 * Validates the OTP input field to ensure it contains only digits.
 *
 * @function validateOtpInput
 * @returns {void}
 */
const validateOtpInput = () => {
  const otpInputField = document.querySelector('.field-otpnumber input');
  otpInputField.placeholder = '••••••';
  otpInputField.addEventListener('input', () => {
    if (!/^\d+$/.test(otpInputField.value)) {
      otpInputField.value = otpInputField.value.slice(0, -1);
    }
  });
};

const addGaps = (elSelector) => {
  const panInputField = document.querySelector(elSelector);
  panInputField.addEventListener('input', () => {
    panInputField.value = panInputField.value.toUpperCase();
    const validInput = validatePanInput(panInputField.value.replace(/\s+/g, ''));
    if (!validInput) {
      panInputField.value = panInputField.value.slice(0, -1);
      if (panInputField.value.length > 10) {
        panInputField.value = panInputField.value.slice(0, 9);
      }
    }
    groupCharacters(panInputField, [5, 4]);
  });
};

const addMobileValidation = () => {
  const validFirstDigits = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
  const inputField = document.querySelector('.field-registeredmobilenumber input');
  inputField.addEventListener('input', () => validatePhoneNumber(inputField, validFirstDigits));
};

setTimeout(() => {
  addGaps('.field-pan.char-gap-4 input');
  addMobileValidation();
}, 1200);

export {
  addGaps,
  addMobileValidation,
  validateOtpInput,
};
