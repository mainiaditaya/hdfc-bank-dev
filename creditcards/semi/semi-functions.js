import { getOTPV1 } from './smart-emi-functions.js';

/* load SEMI Styles- for loading semi - styles - temporary fix */
async function loadSEMIStyles() {
  if (document.querySelector('.semi-form-wrapper')) {
    document.body.classList.add('semi-form');
  }
}
window.setTimeout(() => loadSEMIStyles(), 600);

export {
  // eslint-disable-next-line import/prefer-default-export
  getOTPV1,
};
