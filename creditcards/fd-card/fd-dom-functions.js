import {
  groupCharacters,
  validatePhoneNumber,
} from '../domutils/domutils.js';

const addGaps = () => {
  const inputField = document.querySelector('.char-gap-4 input');
  inputField.addEventListener('input', () => groupCharacters(inputField, 4));
};

const addMobileValidation = () => {
  const validFirstDigits = ['6', '7', '8', '9'];
  const inputField = document.querySelector('.field-registeredmobilenumber input');
  inputField.addEventListener('input', () => validatePhoneNumber(inputField, validFirstDigits));
};

setTimeout(() => {
  addGaps();
  addMobileValidation();
}, 500);

export {
  addGaps,
  addMobileValidation,
};
