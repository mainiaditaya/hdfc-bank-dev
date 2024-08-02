import { groupCharacters } from '../domutils/domutils.js';

const addGaps = () => {
  const inputField = document.querySelector('.char-gap-4 input');
  inputField.addEventListener('input', () => groupCharacters(inputField, 4));
};

setTimeout(() => {
  addGaps();
}, 500);

export default addGaps;
