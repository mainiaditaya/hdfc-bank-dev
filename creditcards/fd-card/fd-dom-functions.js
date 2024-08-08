import {
  groupCharacters,
  validatePhoneNumber,
  validatePanInput,
} from '../domutils/domutils.js';

const addGaps = () => {
  const inputField = document.querySelector('.char-gap-4 input');
  inputField.addEventListener('input', () => {
    const validInput = validatePanInput(inputField.value);
    if (!validInput) {
      inputField.value = inputField.value.slice(0, 3);
    }
    groupCharacters(inputField, [5, 4]);
  });
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
