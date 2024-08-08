import {
  groupCharacters,
  validatePhoneNumber,
  validatePanInput,
} from '../domutils/domutils.js';

const addGaps = () => {
  const panInputField = document.querySelector('.char-gap-4 input');
  panInputField.addEventListener('input', () => {
    const validInput = validatePanInput(panInputField.value);
    if (!validInput) {
      panInputField.value = panInputField.value.slice(0, 3);
    }
    groupCharacters(panInputField, [5, 4]);
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
}, 800);

export {
  addGaps,
  addMobileValidation,
};
