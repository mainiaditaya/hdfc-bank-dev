import { ENDPOINTS } from '../../common/constants.js';
import { urlPath } from '../../common/formutils.js';
import { displayLoader, hideLoaderGif } from '../domutils/domutils.js';
import { invokeJourneyDropOffUpdate } from './fd-journey-util.js';
// import { invokeJourneyDropOffByParam } from './common-journeyutil.js';

const delayedUtilState = {
  visitType: '',
  authMode: '',
  journeyId: '',
  aadharRedirect: '',
  idComRedirect: '',
  finalDapConst: {
    promiseCount: 0,
    affordCount: 10,
    journeyParamState: null,
    journeyParamStateInfo: null,
  },
};

const fdCardBoardingSuccess = async (data, stateInfoData) => {
  const {
    executeInterfaceReqObj, aadharOtpValData, finalDapRequest, finalDapResponse,
  } = data;
  const journeyName = executeInterfaceReqObj?.requestString?.journeyFlag;
  const addressEditFlag = executeInterfaceReqObj?.requestString?.addressEditFlag;
  const { applicationNumber, vkycUrl } = finalDapResponse;
  const { CURRENT_FORM_CONTEXT: currentFormContext } = (await import('../../common/constants.js'));
  currentFormContext.VKYC_URL = vkycUrl;
  // const { result: { mobileValid } } = aadharOtpValData;
  const mobileValid = aadharOtpValData?.result?.mobileValid;
  const resultPanel = document.getElementsByName('resultPanel')?.[0];
  const successPanel = document.getElementsByName('successResultPanel')?.[0];
  resultPanel.setAttribute('data-visible', true);
  successPanel.setAttribute('data-visible', true);
  // setArnNumberInResult(applicationNumber);

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
      currentFormContext.isVideoKyc = true;
      vkycConfirmText.setAttribute('data-visible', true);
      offerLink.setAttribute('data-visible', false);
    }
  }
  if (journeyName === 'NTB' && (kycStatus === 'aadhaar')) {
    vkycCameraConfirmation.setAttribute('data-visible', true);
    vkycCameraPannelInstruction.setAttribute('data-visible', true);
    vkycProceedButton.setAttribute('data-visible', true);
    currentFormContext.isVideoKyc = true;
  }
  currentFormContext.action = 'confirmation';
  currentFormContext.pageGotRedirected = true;
  // temporarly commented and it will be enabled after analytics merge.
  // Promise.resolve(sendPageloadEvent('CONFIRMATION_JOURNEY_STATE', stateInfoData));
  const mobileNumber = stateInfoData.form.login.registeredMobileNumber;
  const leadProfileId = stateInfoData.leadProifileId;
  const journeyId = stateInfoData.currentFormContext.journeyID;
  invokeJourneyDropOffUpdate('CUSTOMER_ONBOARDING_COMPLETED', mobileNumber, leadProfileId, journeyId, stateInfoData);
};

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
  const url = urlPath(ENDPOINTS.journeyDropOffParam);
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
 * @name finalDapFetchRes - recursive async action call maker untill it reaches the finaldap response.
 * @returns {void} error method or succes method based on the criteria of finalDapResponse reach or max limit reach.
 */
const finalDap = async () => {
  const { finalDapConst } = delayedUtilState;
  const eventHandler = {
    successMethod: (data) => {
      console.log(data);
      // const {
      //   currentFormContext: {
      //     executeInterfaceReqObj, finalDapRequest, finalDapResponse,
      //   }, aadhaar_otp_val_data: aadharOtpValData,
      // } = JSON.parse(data.stateInfo);
      hideLoaderGif();
      // successPannelMethod({
      //   executeInterfaceReqObj, aadharOtpValData, finalDapRequest, finalDapResponse,
      // }, JSON.parse(data.stateInfo));
    },
    errorMethod: (err, lastStateData) => {
      console.log(err);
      hideLoaderGif();
      // errorPannelMethod(err, lastStateData);
    },
  };
  try {
    const data = await invokeJourneyDropOffByParam('', '', delayedUtilState.journeyId);
    const journeyDropOffParamLast = data?.formData?.journeyStateInfo?.[data.formData.journeyStateInfo.length - 1];
    finalDapConst.journeyParamState = journeyDropOffParamLast?.state;
    finalDapConst.journeyParamStateInfo = journeyDropOffParamLast?.stateInfo;
    const checkFinalDapSuccess = (journeyDropOffParamLast?.state === 'CUSTOMER_FINAL_DAP_SUCCESS');
    if (checkFinalDapSuccess) {
      return eventHandler.successMethod(journeyDropOffParamLast);
    }
    const err = 'Bad response';
    throw err;
  } catch (error) {
    // "FINAL_DAP_FAILURE"
    finalDapConst.promiseCount += 1;
    const errorCase = (finalDapConst.journeyParamState === 'CUSTOMER_FINAL_DAP_FAILURE' || finalDapConst.promiseCount >= finalDapConst.affordCount);
    const stateInfoData = finalDapConst.journeyParamStateInfo;
    if (errorCase) {
      return eventHandler.errorMethod(error, JSON.parse(stateInfoData));
    }
    return setTimeout(() => finalDap(), 5000);
  }
};

const pageRedirected = () => {
  if (delayedUtilState.aadharRedirect) {
    console.log(delayedUtilState.aadharRedirect);
  }
  if (delayedUtilState.idComRedirect) {
    /**
     * finaldapResponse starts for ETB - address change scenario.
     */
    setTimeout(() => {
      displayLoader();
      finalDap();
    }, 2000);
  }
};

(() => {
  const searchParam = new URLSearchParams(window.location.search);
  delayedUtilState.visitType = searchParam.get('visitType');
  delayedUtilState.authMode = searchParam.get('authmode');
  delayedUtilState.journeyId = searchParam.get('journeyId');
  delayedUtilState.aadharRedirect = delayedUtilState.visitType && (delayedUtilState.visitType === 'EKYC_AUTH');
  delayedUtilState.idComRedirect = delayedUtilState.authMode && ((delayedUtilState.authMode === 'DebitCard') || (delayedUtilState.authMode === 'CreditCard')); // debit card or credit card flow
  pageRedirected();
})();
