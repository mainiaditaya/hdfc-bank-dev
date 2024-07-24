// declare CONSTANTS for (cc) corporate credit card only.
// impoted as CC_CONSTANT key name in all files.

const JOURNEY_NAME = 'CORPORATE_CARD_JOURNEY';
const ID_COM = {
  productCode: 'CORPCC',
  scopeMap: {
    only_casa: {
      no: 'AACC',
      yes: 'ADOBE_PACC',
    },
    casa_asset: {
      no: 'AACC',
      yes: 'ADOBE_PACC',
    },
    casa_cc: 'PADC',
    only_cc: 'OYCC',
  },
};

const DOM_ELEMENT = {
  identifyYourself: {
    chekbox1Label: 'checkboxConsent1Label',
    chekbox2Label: 'checkboxConsent2Label',
    consent1Content: 'consentPanel1',
    consent2Content: 'consentPanel2',
    modalBtnWrapper: 'button-wrapper',
    checkbox1ProductLabel: '.field-checkboxconsent1label',
    checkbox2ProductLabel: '.field-checkboxconsent2label',
    anchorTagClass: 'link',
  },
  otpValidate: {
    otpNumberField: 'otpNumber',
    incorrectOtpField: '.field-incorrectotptext',
  },
  confirmCard: {
    viewAllLink: 'viewAllCardBenefits',
    viewAllContent: 'viewAllCardBenefitsPanel',
    modalBtnWrapper: 'button-wrapper',
  },
  selectKyc: {
    aadharModalContent: 'aadharConsentPopup',
    modalBtnWrapper: 'button-wrapper',
    defaultLanguage: 'English',
  },
  ccWizard: {
    wizardPanel: 'corporateCardWizardView',
    confirmAndSubmitPanel: 'confirmAndSubmitPanel',
  },
};
export {
  JOURNEY_NAME,
  ID_COM,
  DOM_ELEMENT,
};
