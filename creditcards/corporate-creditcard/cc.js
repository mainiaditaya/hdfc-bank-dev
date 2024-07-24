/* eslint-disable no-tabs */
/* eslint no-console: ["error", { allow: ["warn", "error", "debug"] }] */
import openModal from '../../blocks/modal/modal.js';
import { DOM_ELEMENT } from './constant.js';
import * as DOM_API from '../domutils/domutils.js';

const { displayLoader, hideLoaderGif, moveWizardView } = DOM_API;

const {
  identifyYourself,
  otpValidate,
  confirmCard,
  ccWizard,
  yourDetails,
} = DOM_ELEMENT;
/* startCode for creating Modal */
/**
 * Function to link a trigger element with a modal opening functionality.
 * @param {Object} config - Configuration object for the modal.
 * @param {HTMLElement} config.triggerElement - The element triggering the modal.
 * @param {HTMLElement} config.content - The content to display in the modal.
 * @param {String} [config.actionWrapClass] - Wrapper class containing all the buttons.
 * @param {Boolean} [config.reqConsentAgree=false] - Flag indicating whether consent agreement is required.
 * @param {Function} [config.updateUI] - Function for DOM manipulation upon receiving data.
 */

const linkModalFunction = (config) => {
  config?.triggerElement?.addEventListener('click', async (e) => {
    const { checked, type } = e.target;
    const checkBoxElement = (type === 'checkbox') && checked;
    const otherElement = true;
    const elementType = (type === 'checkbox') ? checkBoxElement : otherElement;
    if (elementType) {
      e.preventDefault();
      await openModal(config);
      config?.content?.addEventListener('modalTriggerValue', (event) => {
        const receivedData = event.detail;
        if (config?.updateUI) {
          config?.updateUI(receivedData);
        }
      });
    }
  });
};
/* endCode for creating Modal */

/* modalLinking  in pages  */
// 1.consent-2 checkbox - modal
const consent2Config = {
  // config to create modal for consent-2
  triggerElement: document.getElementsByName(identifyYourself.chekbox2Label)?.[0], // trigger element for calling modalFunction
  content: document.getElementsByName(identifyYourself.consent2Content)?.[0], // content to display in modal
  actionWrapClass: identifyYourself.modalBtnWrapper, // wrapper class containing all the buttons
  reqConsentAgree: false, // Indicates if consent agreement is needed; shows close icon if not.
  /**
	 * Updates the UI based on received data.
	 * @param {Object} receivedData - Data received after the modal button trigger,contains name of the btn triggered which is used to update the UI.
	 */
  updateUI(receivedData) {
    if (receivedData?.checkboxConsent2CTA) {
      // iAgreeConsent2- name of the I agree btn.
      this.triggerElement.checked = true;
      this.triggerElement.dispatchEvent(new Event('change', { bubbles: true }));
    }
    if (receivedData?.closeIcon) {
      // closeIcon - name of the Close x btn
      this.triggerElement.checked = false;
      this.triggerElement.dispatchEvent(new Event('change', { bubbles: true }));
    }
  },
};
linkModalFunction(consent2Config);
// 2.consent-2 otherProduct-text - modal
const consent2OtherProduct = document?.querySelector(identifyYourself.checkbox2ProductLabel)?.querySelector('b');
const linkClass = identifyYourself.anchorTagClass;
consent2OtherProduct?.classList.add(linkClass);
const consent2OtherProductTxtConfig = {
  // config to create modal for consent-2
  triggerElement: consent2OtherProduct, // trigger element for calling modalFunction
  content: consent2Config?.content, // content to display in modal
  actionWrapClass: identifyYourself.modalBtnWrapper, // wrapper class containing all the buttons
  reqConsentAgree: false, // Indicates if consent agreement is needed; shows close icon if not.
  /**
	 * Updates the UI based on received data.
	 * @param {Object} receivedData - Data received after the modal button trigger,contains name of the btn triggered which is used to update the UI.
	 */
  updateUI(receivedData) {
    const checkBox = consent2Config?.triggerElement;
    if (receivedData?.checkboxConsent2CTA) {
      // iAgreeConsent2- name of the I agree btn.
      checkBox.checked = true;
    }
    if (receivedData?.closeIcon) {
      // closeIcon - name of the Close x btn
      checkBox.checked = false;
    }
  },
};
linkModalFunction(consent2OtherProductTxtConfig);

// 3.conset-1 checbox - modal
const consent1Config = {
  // config to create modal for consent-1
  triggerElement: document.getElementsByName(identifyYourself.chekbox1Label)?.[0], // trigger element for calling modalFunction
  content: document.getElementsByName(identifyYourself.consent1Content)?.[0], // content to display in modal
  actionWrapClass: identifyYourself.modalBtnWrapper, // wrapper class containing all the buttons
  reqConsentAgree: true, // Indicates if consent agreement is needed; shows close icon if not.
  /**
	 * Updates the UI based on received data.
	 * @param {Object} receivedData - Data received after the modal button trigger,contains name of the btn triggered which is used to update the UI.
	 */
  updateUI(receivedData) {
    if (receivedData?.checkboxConsent1CTA) {
      // iAgreeConsent2- name of the I agree btn.
      this.triggerElement.checked = true;
      this.triggerElement.dispatchEvent(new Event('change', { bubbles: true }));
    }
    if (receivedData?.closeIcon) {
      // closeIcon - name of the Close x btn
      this.triggerElement.checked = false;
      this.triggerElement.dispatchEvent(new Event('change', { bubbles: true }));
    }
  },
};
linkModalFunction(consent1Config);

// 4.consent-1 requestProduct-text - modal
const consent1RequestProduct = document?.querySelector(identifyYourself.checkbox1ProductLabel)?.querySelector('b');
consent1RequestProduct?.classList.add(linkClass);
const consent2RequestProductTxtConfig = {
  // config to create modal for consent-2
  triggerElement: consent1RequestProduct, // trigger element for calling modalFunction
  content: consent1Config?.content, // content to display in modal
  actionWrapClass: identifyYourself.modalBtnWrapper, // wrapper class containing all the buttons
  reqConsentAgree: true, // Indicates if consent agreement is needed; shows close icon if not.
  /**
	 * Updates the UI based on received data.
	 * @param {Object} receivedData - Data received after the modal button trigger,contains name of the btn triggered which is used to update the UI.
	 */
  updateUI(receivedData) {
    const checkBox = consent1Config?.triggerElement;
    if (receivedData?.checkboxConsent1CTA) {
      // iAgreeConsent2- name of the I agree btn.
      checkBox.checked = true;
    }
    if (receivedData?.closeIcon) {
      // closeIcon - name of the Close x btn
      checkBox.checked = false;
    }
  },
};
linkModalFunction(consent2RequestProductTxtConfig);

// 5.wizard screen getCard-viewAll button - modal
const viewAllBtnPannelConfig = {
  triggerElement: document.getElementsByName(confirmCard.viewAllLink)?.[0],
  content: document.getElementsByName(confirmCard.viewAllContent)?.[0],
  actionWrapClass: confirmCard.modalBtnWrapper,
  reqConsentAgree: true,
};
linkModalFunction(viewAllBtnPannelConfig);

/**
 * Hides the incorrect OTP text message when the user starts typing in the OTP input field.
 */
const removeIncorrectOtpText = () => {
  const otpNumbrQry = document.getElementsByName(otpValidate.otpNumberField)?.[0];
  const incorectOtp = document.querySelector(otpValidate.incorrectOtpField);
  otpNumbrQry?.addEventListener('input', (e) => {
    if (e.target.value) {
      incorectOtp.style.display = 'none';
    }
  });
};
removeIncorrectOtpText();

const errorPannelMethod = () => {
  const errorPannel = document.getElementsByName('errorResultPanel')?.[0];
  const resultPanel = document.getElementsByName('resultPanel')?.[0];
  resultPanel.setAttribute('data-visible', true);
  errorPannel.setAttribute('data-visible', true);
};

const setArnNumberInResult = (arnNumRef) => {
  const nameOfArnRefPanel = 'arnRefNumPanel';
  const classNamefieldArnNo = '.field-newarnnumber';
  const arnRefNumPanel = document.querySelector(`[name= ${nameOfArnRefPanel}]`);
  const arnNumberElement = arnRefNumPanel.querySelector(classNamefieldArnNo);
  if (arnNumberElement) {
    // Manipulate the content of the <p> tag inside '.field-newarnnumber'
    arnNumberElement.querySelector('p').textContent = arnNumRef;
  }
};

const successPannelMethod = async (data) => {
  const {
    executeInterfaceReqObj, aadharOtpValData, finalDapRequest, finalDapResponse,
  } = data;
  const journeyName = executeInterfaceReqObj?.requestString?.journeyFlag;
  const addressEditFlag = executeInterfaceReqObj?.requestString?.addressEditFlag;
  const { applicationNumber, vkycUrl } = finalDapResponse;
  const { currentFormContext } = (await import('../../common/journey-utils.js')).corpCreditCardContext;
  currentFormContext.VKYC_URL = vkycUrl;
  // const { result: { mobileValid } } = aadharOtpValData;
  const mobileValid = aadharOtpValData?.result?.mobileValid;
  const resultPanel = document.getElementsByName('resultPanel')?.[0];
  const successPanel = document.getElementsByName('successResultPanel')?.[0];
  resultPanel.setAttribute('data-visible', true);
  successPanel.setAttribute('data-visible', true);
  setArnNumberInResult(applicationNumber);

  const vkycProceedButton = document.querySelector('.field-vkycproceedbutton ');
  const offerLink = document.querySelector('.field-offerslink');
  const vkycConfirmText = document.querySelector('.field-vkycconfirmationtext');
  // const filler4Val = finalDapRequest?.requestString?.VKYCConsent?.split(/[0-9]/g)?.[0];
  // const mobileMatch = !(filler4Val === 'NVKYC');
  const mobileMatch = !(mobileValid === 'n'); // (mobileValid === 'n') - unMatched - this should be the condition which has to be finalDap - need to verify.
  const kycStatus = (finalDapRequest.requestString.biometricStatus);
  const vkycCameraConfirmation = document.querySelector(`[name= ${'vkycCameraConfirmation'}]`);
  const vkycCameraPannelInstruction = document.querySelector('.field-cameraconfirmationpanelinstruction');

  if (journeyName === 'ETB') {
    if (addressEditFlag === 'N') {
      vkycProceedButton.setAttribute('data-visible', false);
      vkycConfirmText.setAttribute('data-visible', false);
      offerLink.setAttribute('data-visible', true);
    } else if (kycStatus === 'OVD') {
      vkycProceedButton.setAttribute('data-visible', false);
      vkycConfirmText.setAttribute('data-visible', true);
      offerLink.setAttribute('data-visible', false); // Adjusted assumption for offerLink
    } else if (mobileMatch && kycStatus === 'aadhaar' && addressEditFlag === 'Y') {
      vkycProceedButton.setAttribute('data-visible', false);
      vkycConfirmText.setAttribute('data-visible', false);
      offerLink.setAttribute('data-visible', true);
    } else {
      vkycProceedButton.setAttribute('data-visible', true);
      vkycConfirmText.setAttribute('data-visible', true);
      offerLink.setAttribute('data-visible', false);
    }
  }
  if (journeyName === 'NTB' && (kycStatus === 'aadhaar')) {
    vkycCameraConfirmation.setAttribute('data-visible', true);
    vkycCameraPannelInstruction.setAttribute('data-visible', true);
    vkycProceedButton.setAttribute('data-visible', true);
  }
};

// post-redirect-aadhar-or-idcom
const searchParam = new URLSearchParams(window.location.search);
const visitTypeParam = searchParam.get('visitType');
const authModeParam = searchParam.get('authmode');
const journeyId = searchParam.get('journeyId');
const aadharRedirect = visitTypeParam && (visitTypeParam === 'EKYC_AUTH');
const idComRedirect = authModeParam && ((authModeParam === 'DebitCard') || (authModeParam === 'CreditCard')); // debit card or credit card flow

/**
 * @name invokeJourneyDropOffByParam
 * @param {string} mobileNumber - mobileNumber-optional
 * @param {string} leadProfileId - leadProfileId-optional
 * @param {string} journeyID - JourneyId-required
 * @returns {object} - response-data
 */
const invokeJourneyDropOffByParam = async (mobileNumber, leadProfileId, journeyID) => {
  const journeyJSONObj = {
    RequestPayload: {
      leadProfile: {
      },
      journeyInfo: {
        journeyID,
      },
    },
  };
  const url = 'https://applyonlinedev.hdfcbank.com/content/hdfc_commonforms/api/journeydropoffparam.json';
  const method = 'POST';
  try {
    const res = await fetch(url, {
      method,
      body: JSON.stringify(journeyJSONObj),
      mode: 'cors',
      headers: {
        'Content-type': 'text/plain',
        Accept: 'application/json',
      },
    });
    const data = await res.json();
    return data;
  } catch (error) {
    return error;
  }
};

/**
 * @name finalDap - constant-variables store
 */
const finalDap = {
  PROMOSE_COUNT: 0,
  AFFORD_COUNT: 5,
  journeyParamState: null,
};

/**
 * @name finalDapFetchRes - recursive async action call maker untill it reaches the finaldap response.
 * @returns {void} error method or succes method based on the criteria of finalDapResponse reach or max limit reach.
 */
const finalDapFetchRes = async () => {
  const eventHandler = {
    successMethod: (data) => {
      const {
        currentFormContext: {
          executeInterfaceReqObj, finalDapRequest, finalDapResponse,
        }, aadhaar_otp_val_data: aadharOtpValData,
      } = JSON.parse(data.stateInfo);
      hideLoaderGif();
      successPannelMethod({
        executeInterfaceReqObj, aadharOtpValData, finalDapRequest, finalDapResponse,
      });
    },
    errorMethod: (err) => {
      hideLoaderGif();
      errorPannelMethod(err);
      // eslint-disable-next-line no-console
      console.log(err);
    },
  };
  try {
    const data = await invokeJourneyDropOffByParam('', '', journeyId);
    const journeyDropOffParamLast = data.formData.journeyStateInfo[data.formData.journeyStateInfo.length - 1];
    finalDap.journeyParamState = journeyDropOffParamLast.state;
    const checkFinalDapSuccess = (journeyDropOffParamLast.state === 'CUSTOMER_FINAL_DAP_SUCCESS');
    if (checkFinalDapSuccess) {
      return eventHandler.successMethod(journeyDropOffParamLast);
    }
    const err = 'Bad response';
    throw err;
  } catch (error) {
    // "FINAL_DAP_FAILURE"
    finalDap.PROMOSE_COUNT += 1;
    const errorCase = (finalDap.journeyParamState === 'CUSTOMER_FINAL_DAP_FAILURE' || finalDap.PROMOSE_COUNT >= finalDap.AFFORD_COUNT);
    if (errorCase) {
      return eventHandler.errorMethod(error);
    }
    return setTimeout(() => finalDapFetchRes(), 1000);
  }
};

//

/**
 * Redirects the user to different panels based on conditions.
 * If `aadhar` is true, navigates from 'corporateCardWizardView' to 'confirmAndSubmitPanel'
 * If `idCom` is true, initiates a journey drop-off process and handles the response which handles after all the final dap api call.
 * @param {boolean} aadhar - Indicates whether Aadhar redirection is triggered.
 * @param {boolean} idCom - Indicates whether ID com redirection is triggered.
 * @returns {void}
 */
const pageRedirected = (aadhar, idCom) => {
  if (aadhar) {
    moveWizardView(ccWizard.wizardPanel, ccWizard.confirmAndSubmitPanel);
  }
  if (idCom) {
    /**
     * finaldapResponse starts for ETB - address change scenario.
     */
    setTimeout(() => {
      displayLoader();
      finalDapFetchRes();
    }, 2000);
  }
};
pageRedirected(aadharRedirect, idComRedirect);

/**
 * Sets the maximum allowable date for an array of date input fields to today's date.
 * @param {HTMLElement[]} dateFields - An array of input field elements to be validated.
 */
[yourDetails.employedDate, yourDetails.personalDetailDob, identifyYourself.dob].forEach((dateField) => DOM_API.setMaxDateToToday(dateField));

/**
 *  Validates and restricts input on the OTP number field to allow only numeric characters.
 *  Hides the incorrect OTP text message when the user starts typing in the OTP input field.
 */
const otpFieldValidate = () => {
  const otpNumber = document.querySelector(`[name= ${identifyYourself.otpNumber}]`);
  const incorectOtp = document.querySelector(`.${identifyYourself.incorrectOtp}`);
  otpNumber?.addEventListener('input', (e) => {
    if (e.target.value) {
      const input = e.target;
      input.value = input.value.replace(/\D/g, ''); // Replace non-numeric characters with an empty string
      incorectOtp.style.display = 'none';
    }
  });
};
otpFieldValidate();

/**
 * Applies the restrictToAlphabetsNoSpaces function to an array of input field names.
 * The function restricts input to alphabetic characters only, excluding numbers, symbols, and spaces.
 * @param {string[]} inputNames - An array of input field names to be restricted.
 */
[yourDetails.firstName, yourDetails.middleName, yourDetails.lastName].forEach((inputField) => DOM_API.restrictToAlphabetsNoSpaces(inputField));
