import { CURRENT_FORM_CONTEXT } from '../../common/constants.js';
import { displayLoader, hideLoaderGif, setArnNumberInResult } from '../domutils/domutils.js';
import { invokeJourneyDropOffByJourneyId } from './common-journeyutil.js';
import { ANALYTICS } from './constant.js';
import { invokeJourneyDropOffUpdate } from './fd-journey-util.js';
import sendFDAnalytics from './analytics.js';

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
  const mobileNumber = stateInfoData.form.login.registeredMobileNumber;
  const leadProfileId = stateInfoData.leadProifileId;
  const journeyId = stateInfoData.currentFormContext.journeyID;
  const resultPanel = document.getElementsByName('resultPanel')?.[0];
  const successPanel = document.getElementsByName('successResultPanel')?.[0];
  resultPanel.setAttribute('data-visible', true);
  successPanel.setAttribute('data-visible', true);
  if (data?.finalDapResponse?.vkycUrl !== '') {
    CURRENT_FORM_CONTEXT.VKYC_URL = data?.finalDapResponse?.vkycUrl;
    const vkycConfirmationPanel = document.querySelector(`[name= ${'vkycConfirmationPanel'}]`);
    vkycConfirmationPanel.setAttribute('data-visible', true);
  }
  setArnNumberInResult(stateInfoData.currentFormContext.ARN_NUM, 'refNumPanel', 'referenceNumber');
  invokeJourneyDropOffUpdate('CUSTOMER_ONBOARDING_COMPLETED', mobileNumber, leadProfileId, journeyId, stateInfoData);
};

const fdCardBoardingFailure = (err, stateInfoData) => {
  const errorPannel = document.getElementsByName('errorResultPanel')?.[0];
  const resultPanel = document.getElementsByName('resultPanel')?.[0];
  resultPanel.setAttribute('data-visible', true);
  errorPannel.setAttribute('data-visible', true);
  const mobileNumber = stateInfoData.form.login.registeredMobileNumber;
  const leadProfileId = stateInfoData.leadProifileId;
  const journeyId = stateInfoData.currentFormContext.journeyID;
  invokeJourneyDropOffUpdate('CUSTOMER_ONBOARDING_FAILURE', mobileNumber, leadProfileId, journeyId, stateInfoData);
};

/**
 * @name finalDapFetchRes - recursive async action call maker untill it reaches the finaldap response.
 * @returns {void} error method or succes method based on the criteria of finalDapResponse reach or max limit reach.
 */
const finalDapFetchRes = async () => {
  const { finalDapConst } = delayedUtilState;
  const eventHandler = {
    successMethod: (data) => {
      const {
        currentFormContext: {
          executeInterfaceRequest,
          finalDapRequest,
          finalDapResponse,
        }, aadhaar_otp_val_data: aadharOtpValData,
      } = JSON.parse(data.stateInfo);
      hideLoaderGif();
      fdCardBoardingSuccess({
        executeInterfaceRequest, aadharOtpValData, finalDapRequest, finalDapResponse,
      }, JSON.parse(data.stateInfo));
    },
    errorMethod: (err, lastStateData) => {
      hideLoaderGif();
      fdCardBoardingFailure(err, lastStateData);
    },
  };
  try {
    const data = await invokeJourneyDropOffByJourneyId(delayedUtilState.journeyId);
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
  if (!delayedUtilState.aadharRedirect && !delayedUtilState.idComRedirect) {
    const { formLoad } = ANALYTICS.event;
    const journeyData = {};
    // eslint-disable-next-line no-underscore-dangle, no-undef
    journeyData.journeyId = myForm.resolveQualifiedName('$form.runtime.journeyId')._data.$_value;
    // journeyData.journeyName = CURRENT_FORM_CONTEXT.journeyName;
    journeyData.journeyName = ANALYTICS.JOURNEY_NAME;
    sendFDAnalytics(formLoad.type, formLoad.pageName, {}, formLoad.journeyState, journeyData);
  }
  if (delayedUtilState.idComRedirect) {
    displayLoader();
    setTimeout(() => {
      finalDapFetchRes();
    }, 5000);
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
