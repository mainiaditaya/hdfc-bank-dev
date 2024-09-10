import { getUrlParamCaseInsensitive } from '../../common/formutils.js';
import { IPA_RESPONSE } from './ipautil.js';

let selectedCardIndex = -1;
let knowMoreClickedIndex = -1;

/**
 *
 * @name confirmCardClickHandler
 * @param {Object} globals - The global context object containing various information.
 */
const confirmCardClickHandler = (globals) => {
  const { addressDetails, employeeAssistance } = globals.form.fdBasedCreditCardWizard.basicDetails.reviewDetailsView;
  const { aadharBiometricVerification } = globals.form.selectKYCOptionsPanel.selectKYCMethodOption1;
  const inPersonBioKYC = getUrlParamCaseInsensitive('InpersonBioKYC');
  if ((addressDetails.mailingAddressToggle._data.$_value === 'off' || inPersonBioKYC.toLowerCase() === 'yes')
  && employeeAssistance.inPersonBioKYCPanel.inPersonBioKYCOptions._data.$_value === '0') {
    globals.functions.setProperty(aadharBiometricVerification, { value: '0' });
  }
};

const setknowMoreBenefitsPanelData = (moreFeatures, knowMoreBenefitsPanel, globals) => {
  if (!moreFeatures?.length) return;
  const transformedMoreFeatures = moreFeatures.map((feature) => ({
    cardBenefitsText: feature,
  }));
  globals.functions.importData({ items: transformedMoreFeatures }, knowMoreBenefitsPanel.$qualifiedName);
};

const knowMoreCardClickHandler = (globals) => {
  const { knowMoreBenefitsPanel } = globals.form.fdBasedCreditCardWizard.selectCard.knowMorePopupWrapper.viewAllCardBenefitsPanel;
  const { knowMorePopupWrapper } = globals.form.fdBasedCreditCardWizard.selectCard;

  knowMoreClickedIndex = (IPA_RESPONSE?.productDetails?.length > 1) ? globals.field.$parent.$index : 0;
  const moreFeatures = IPA_RESPONSE?.productDetails?.[knowMoreClickedIndex]?.features;
  setknowMoreBenefitsPanelData(moreFeatures, knowMoreBenefitsPanel, globals);

  globals.functions.setProperty(knowMorePopupWrapper, { visible: true });
};

const selectCardBackClickHandler = (globals) => {
  const { selectCardFaciaPanelMultiple } = globals.form.fdBasedCreditCardWizard.selectCard;
  selectedCardIndex = -1;
  if (IPA_RESPONSE.productDetails.length > 1) {
    IPA_RESPONSE.productDetails.slice(0, -1).forEach(() => {
      globals.functions.dispatchEvent(selectCardFaciaPanelMultiple, 'removeItem');
    });
    globals.functions.setProperty(selectCardFaciaPanelMultiple[0].cardSelection, { value: undefined });
  }
};

const cardSelectHandler = (cardsPanel, globals) => {
  if (selectedCardIndex !== -1) {
    globals.functions.setProperty(cardsPanel[selectedCardIndex].cardSelection, { value: undefined });
    setTimeout(() => {
      selectedCardIndex = cardsPanel.findIndex((item) => item.cardSelection._data.$value === '0');
    }, 50);
  } else {
    selectedCardIndex = cardsPanel.findIndex((item) => item.cardSelection._data.$value === '0');
  }
};

const popupBackClickHandler = (globals) => {
  const { knowMoreBenefitsPanel } = globals.form.fdBasedCreditCardWizard.selectCard.knowMorePopupWrapper.viewAllCardBenefitsPanel;
  const { knowMorePopupWrapper } = globals.form.fdBasedCreditCardWizard.selectCard;
  globals.functions.setProperty(knowMorePopupWrapper, { visible: false });
  if (knowMoreClickedIndex !== -1) {
    IPA_RESPONSE.productDetails?.[knowMoreClickedIndex]?.features.slice(0, -1).forEach(() => {
      globals.functions.dispatchEvent(knowMoreBenefitsPanel, 'removeItem');
    });
  }
};

export {
  knowMoreCardClickHandler,
  confirmCardClickHandler,
  selectCardBackClickHandler,
  cardSelectHandler,
  popupBackClickHandler,
};
