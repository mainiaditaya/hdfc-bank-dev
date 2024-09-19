import { CURRENT_FORM_CONTEXT, ENDPOINTS } from '../../common/constants.js';
import { urlPath } from '../../common/formutils.js';
import { displayLoader, hideLoaderGif, setArnNumberInResult } from '../domutils/domutils.js';
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
  // const {
  //   executeInterfaceRequest, aadharOtpValData, finalDapRequest, finalDapResponse,
  // } = data;
  const mobileNumber = stateInfoData.form.login.registeredMobileNumber;
  const leadProfileId = stateInfoData.leadProifileId;
  const journeyId = stateInfoData.currentFormContext.journeyID;
  const resultPanel = document.getElementsByName('resultPanel')?.[0];
  const successPanel = document.getElementsByName('successResultPanel')?.[0];
  debugger;
  resultPanel.setAttribute('data-visible', true);
  successPanel.setAttribute('data-visible', true);
  setArnNumberInResult(window.ARN_NUM);
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
const finalDapFetchRes = async () => {
  const { finalDapConst } = delayedUtilState;
  const eventHandler = {
    successMethod: (data) => {
      console.log(JSON.parse(data.stateInfo));
      const {
        currentFormContext: {
          executeInterfaceRequest,
        }, aadhaar_otp_val_data: aadharOtpValData,
      } = JSON.parse(data.stateInfo);
      hideLoaderGif();
      const { finalDapRequest, finalDapResponse } = window;
      fdCardBoardingSuccess({
        executeInterfaceRequest, aadharOtpValData, finalDapRequest, finalDapResponse,
      }, JSON.parse(data.stateInfo));
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
    return setTimeout(() => finalDapFetchRes(), 5000);
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
      finalDapFetchRes();
    }, 20000);
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
