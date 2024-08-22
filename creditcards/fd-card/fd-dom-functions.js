import {
  groupCharacters,
  validatePhoneNumber,
  validatePanInput,
  createLabelInElement,
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

const addGaps = () => {
  const panInputField = document.querySelector('.char-gap-4 input');
  panInputField.addEventListener('input', () => {
    const vaildInput = validatePanInput(panInputField.value.replace(/\s+/g, ''));
    if (!vaildInput) {
      panInputField.value = panInputField.value.slice(0, -1);
      if (panInputField.value.length > 10) {
        panInputField.value = panInputField.value.slice(0, 9);
      }
    }
    groupCharacters(panInputField, [5, 4]);
  });
};

const addMobileValidation = () => {
  const validFirstDigits = ['6', '7', '8', '9'];
  const inputField = document.querySelector('.field-registeredmobilenumber input');
  inputField.addEventListener('input', () => validatePhoneNumber(inputField, validFirstDigits));
};

/**
 * Updates name attribute of customer id radio buttons
 *
 * @function updateElementAttr
 * @returns {void}
 */
const updateElementAttr = () => {
  const custIdRadioButtons = Array.from(document.querySelectorAll('.field-multiplecustidselect input'));
  custIdRadioButtons.forEach((radioButton) => {
    radioButton.setAttribute('name', 'cust-id-radio');
  });
};

/**
 * calls function to update checkbox to label
 *
 * @function changeCheckboxToToggle
 * @returns {void}
 */
const changeCheckboxToToggle = () => {
  createLabelInElement('.field-employeeassistancetoggle', 'employee-assistance-toggle__label');
  createLabelInElement('.field-mailingaddresstoggle', 'mailing-address-toggle__label');
};

setTimeout(() => {
  addGaps();
  addMobileValidation();
}, 1000);

export {
  addGaps,
  addMobileValidation,
  validateOtpInput,
  updateElementAttr,
  changeCheckboxToToggle,
};
