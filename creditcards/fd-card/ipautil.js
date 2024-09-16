import { BASEURL, CURRENT_FORM_CONTEXT, FORM_RUNTIME } from '../../common/constants.js';
import { urlPath } from '../../common/formutils.js';
import {
  // fetchJsonResponse,
  fetchRecursiveResponse,
} from '../../common/makeRestAPI.js';
import { FD_ENDPOINTS } from './constant.js';
// import { SELECTED_CUSTOMER_ID } from './customeridutil.js';

const IPA_RESPONSE = {};
const createIpaRequest = (payload, globals) => {
  const ipaRequest = {
    requestString: {
      mobileNumber: globals.form.loginMainPanel.loginPanel.mobilePanel.registeredMobileNumber.$value,
      applRefNumber: payload.APS_APPL_REF_NUM,
      eRefNumber: CURRENT_FORM_CONTEXT.referenceNumber,
      // customerID: SELECTED_CUSTOMER_ID.selectedCustId.customerId,
      customerID: '50187305',
      journeyID: CURRENT_FORM_CONTEXT.journeyID,
      journeyName: CURRENT_FORM_CONTEXT.journeyName,
    },
  };
  return ipaRequest;
};
/**
 * Executes an IPA request.
 * @name ipa
 * @param {object} payload - The payload for the IPA request.
 * @param {boolean} showLoader - Whether to show a loader while the request is in progress.
 * @param {boolean} hideLoader - Whether to hide the loader after the request is complete.
 * @param {object} globals - The global context object.
 * @returns {Promise<object>} A promise that resolves to the response of the IPA request.
 */
const ipa = (payload, showLoader, hideLoader, globals) => {
  CURRENT_FORM_CONTEXT.executeInterfaceResponse = payload;
  const ipaRequest = createIpaRequest(payload, globals);
  const apiEndPoint = urlPath(FD_ENDPOINTS.ipa);
  if (showLoader) FORM_RUNTIME.ipa();
  const fieldName = ['IPAResponse', 'productEligibility', 'productDetails'];
  return fetchRecursiveResponse(apiEndPoint, ipaRequest, 'POST', Number(payload.ipaDuration), Number(payload.ipaTimer), fieldName, hideLoader);
  // return fetchJsonResponse(apiEndPoint, ipaRequest, 'POST', hideLoader);
};

const updateData = (globals, productDetail, panel, index) => {
  const { setProperty } = globals.functions;
  const {
    product,
    joiningFee = '0',
    renewalFee = '0',
    cardLine,
    keyBenefits = [],
    productCode,
  } = {
    ...productDetail,
    joiningFee: productDetail.joiningFee || '0',
    renewalFee: productDetail.renewalFee || '0',
  };

  const properties = [
    { element: panel.cardSelection_display, value: product },
    { element: panel.joiningFeeAmt, value: joiningFee },
    { element: panel.renewalFeeAmt, value: renewalFee },
    { element: panel.cardTagline, value: cardLine },
    { element: panel.cardfeatures1, value: keyBenefits[0] || '' },
    { element: panel.cardfeatures2, value: keyBenefits[1] || '' },
    { element: panel.cardfeatures3, value: keyBenefits[2] || '' },
  ];

  properties.forEach(({ element, value }) => setProperty(element, { value }));

  const imageEl = document.querySelectorAll('.field-cardfaciaimage > picture')[index];
  const imagePath = `${BASEURL}${productCode}?width=2000&optimize=medium`;

  ['img', 'source'].forEach((tag) => {
    imageEl.querySelectorAll(tag).forEach((el) => el.setAttribute(tag === 'img' ? 'src' : 'srcset', imagePath));
  });
};

const bindSingleCardDetails = (panel, globals, productDetail) => {
  const { singleCardKeyBenefitsPanel } = panel;
  const {
    FeesSingleCard, singleCardBenefitsText1, singleCardBenefitsText2, singleCardBenefitsText3,
  } = singleCardKeyBenefitsPanel;

  const { setProperty } = globals.functions;
  const {
    product,
    joiningFee = '0',
    renewalFee = '0',
    cardLine,
    keyBenefits = [],
    productCode,
  } = {
    ...productDetail,
    joiningFee: productDetail.joiningFee || '0',
    renewalFee: productDetail.renewalFee || '0',
  };

  const properties = [
    { element: panel.singleCardName, value: product },
    { element: FeesSingleCard.joiningFeeAmt, value: joiningFee },
    { element: FeesSingleCard.renewalFeeAmt, value: renewalFee },
    { element: panel.singleCardTitle, value: cardLine },
    { element: singleCardBenefitsText1, value: keyBenefits[0] || '' },
    { element: singleCardBenefitsText2, value: keyBenefits[1] || '' },
    { element: singleCardBenefitsText3, value: keyBenefits[2] || '' },
  ];

  properties.forEach(({ element, value }) => setProperty(element, { value }));

  const imageEl = document.querySelector('.field-singlecardfacia > picture');
  const imagePath = `${BASEURL}${productCode}?width=2000&optimize=medium`;

  imageEl.querySelectorAll('img').forEach((img) => img.setAttribute('src', imagePath));
  imageEl.querySelectorAll('source').forEach((source) => source.setAttribute('srcset', imagePath));
};

/**
 *
 * @name ipaSuccessHandler
 * @param {object} response - The response recieved from the IPA request.
 * @param {object} globals - The global context object.
 * @returns {Promise<object>}
 */
const ipaSuccessHandler = (response, globals) => {
  CURRENT_FORM_CONTEXT.eRefNumber = response?.APS_E_REF_NUM;
  const productDetails = response?.productEligibility?.productDetails;
  const { selectCard, selectFD, basicDetails } = globals.form.fdBasedCreditCardWizard;
  const {
    eligibleCreditLimitAmount,
    selectCardFaciaPanelMultiple,
    selectCardFaciaPanelSingle,
    selectCardHeaderPanel,
    continueToIDCOM,
    selectIdentifier,
  } = selectCard;
  const { creditLimit } = selectFD.fdSelectionInfo.selectFDDetailsPanel;
  const productCount = productDetails.length;
  IPA_RESPONSE.productDetails = productDetails;
  globals.functions.setProperty(eligibleCreditLimitAmount, { value: creditLimit.$value });
  if (productCount === 1) {
    globals.functions.setProperty(selectCardHeaderPanel.selectSuitableCardText, { visible: false });
    globals.functions.setProperty(selectCardFaciaPanelMultiple, { visible: false });
    globals.functions.setProperty(selectCardFaciaPanelSingle, { visible: true });
    bindSingleCardDetails(selectCardFaciaPanelSingle, globals, productDetails[0]);
  } else if (productCount > 1) {
    globals.functions.setProperty(selectCardFaciaPanelSingle, { visible: false });
    globals.functions.setProperty(selectCardFaciaPanelMultiple, { visible: true });
    productDetails.forEach((productDetail, i) => {
      if (i < productCount - 1) {
        globals.functions.dispatchEvent(selectCardFaciaPanelMultiple, 'addItem');
      }
      setTimeout(() => {
        updateData(globals, productDetail, selectCardFaciaPanelMultiple[i], i);
      }, i * 40);
    });
    globals.functions.setProperty(selectCardFaciaPanelMultiple[0].cardSelection, { value: 0 });
  }
  if (!CURRENT_FORM_CONTEXT.customerIdentityChange && basicDetails.reviewDetailsView.addressDetails.mailingAddressToggle._data.$_value === 'on') {
    globals.functions.setProperty(selectIdentifier, { visible: false });
    globals.functions.setProperty(continueToIDCOM, { visible: true });
  } else {
    globals.functions.setProperty(selectIdentifier, { visible: true });
    globals.functions.setProperty(continueToIDCOM, { visible: false });
  }
};

export {
  ipa,
  ipaSuccessHandler,
  IPA_RESPONSE,
};
