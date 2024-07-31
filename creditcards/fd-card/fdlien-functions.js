import { ageValidator } from '../../common/formutils.js';
import * as FD_CONSTANT from './constant.js';

/**
 * Validates the date of birth field to ensure the age is between 18 and 70.
 * @param {Object} globals - The global object containing necessary data for DAP request.
*/
const validateLogin = (globals) => {
  const dobValue = globals.form.loginMainPanel.loginPanel.identifierPanel.dateOfBirth.$value;
  const panValue = globals.form.loginMainPanel.loginPanel.identifierPanel.pan.$value;
  const panDobSelection = globals.form.loginMainPanel.loginPanel.identifierPanel.panDobSelection.$value;
  const mobileNo = globals.form.loginMainPanel.loginPanel.mobilePanel.registeredMobileNumber.$value;
  const radioSelect = (panDobSelection === '0') ? 'DOB' : 'PAN';
  const regexPan = /^[a-zA-Z]{3}[Pp][a-zA-Z][0-9]{4}[a-zA-Z]{1}/g;
  // const consentFirst = globals.form.consentFragment.checkboxConsent1Label.$value;
  const panErrorText = FD_CONSTANT.ERROR_MSG.panError;
  globals.functions.setProperty(globals.form.loginMainPanel.getOTPbutton, { enabled: false });

  const panInput = document.querySelector(`[name=${'pan'} ]`);
  const panWrapper = panInput.parentElement;
  switch (radioSelect) {
    case 'DOB':
      if (dobValue && String(new Date(dobValue).getFullYear()).length === 4) {
        const dobErrorText = FD_CONSTANT.ERROR_MSG.ageLimit;
        const ageValid = ageValidator(FD_CONSTANT.MIN_AGE, FD_CONSTANT.MAX_AGE, dobValue);
        if (ageValid && (mobileNo?.length === 10)) {
          globals.functions.setProperty(globals.form.loginMainPanel.getOTPbutton, { enabled: true });
          globals.functions.markFieldAsInvalid('$form.loginMainPanel.loginPanel.identifierPanel.dateOfBirth', '', { useQualifiedName: true });
        }
        if (ageValid) {
          globals.functions.markFieldAsInvalid('$form.loginMainPanel.loginPanel.identifierPanel.dateOfBirth', '', { useQualifiedName: true });
          globals.functions.setProperty(globals.form.loginMainPanel.loginPanel.identifierPanel.dateOfBirth, { valid: true });
        }
        if (!ageValid) {
          globals.functions.markFieldAsInvalid('$form.loginMainPanel.loginPanel.identifierPanel.dateOfBirth', dobErrorText, { useQualifiedName: true });
          globals.functions.setProperty(globals.form.loginMainPanel.getOTPbutton, { enabled: false });
        }
        if (!(mobileNo?.length === 10)) {
          globals.functions.setProperty(globals.form.loginMainPanel.getOTPbutton, { enabled: false });
        }
      }
      break;
    case 'PAN':
      panWrapper.setAttribute('data-empty', true);
      if (panValue) {
        panWrapper.setAttribute('data-empty', false);
        const validPan = regexPan.test(panValue);
        if (validPan && (mobileNo?.length === 10)) {
          globals.functions.markFieldAsInvalid('$form.loginMainPanel.loginPanel.identifierPanel.pan', '', { useQualifiedName: true });
          globals.functions.setProperty(globals.form.loginMainPanel.getOTPbutton, { enabled: true });
        }
        if (validPan) {
          globals.functions.markFieldAsInvalid('$form.loginMainPanel.loginPanel.identifierPanel.pan', '', { useQualifiedName: true });
          globals.functions.setProperty(globals.form.loginMainPanel.loginPanel.identifierPanel.pan, { valid: true });
        }
        if (!validPan) {
          globals.functions.markFieldAsInvalid('$form.loginMainPanel.loginPanel.identifierPanel.pan', panErrorText, { useQualifiedName: true });
          globals.functions.setProperty(globals.form.loginMainPanel.getOTPbutton, { enabled: false });
        }
        if (!(mobileNo?.length === 10)) {
          globals.functions.setProperty(globals.form.loginMainPanel.getOTPbutton, { enabled: false });
        }
      }
      break;
    default:
      globals.functions.setProperty(globals.form.loginMainPanel.getOTPbutton, { enabled: false });
  }
};

async function loadFDStyles() {
  if (document.querySelector('.fd-form-wrapper')) {
    document.body.classList.add('fdlien');
    // const elements = document.querySelectorAll('.section.cmp-container-container');
    // elements.forEach((element) => {
    //   if (element.dataset.sectionStatus === 'loaded') {
    //     element.style.setProperty('display', 'none', 'important');
    //   } else {
    //     const observer = new MutationObserver((mutations) => {
    //       mutations.forEach((mutation) => {
    //         if (mutation.type === 'attributes' && mutation.attributeName === 'data-section-status') {
    //           if (element.dataset.sectionStatus === 'loaded') {
    //             element.style.setProperty('display', 'none', 'important');
    //             observer.disconnect();
    //           }
    //         }
    //       });
    //     });
    //     observer.observe(element, { attributes: true });
    //   }
    // });
  }
}
window.setTimeout(() => loadFDStyles(), 1000);

export {
  // eslint-disable-next-line import/prefer-default-export
  validateLogin,
};
