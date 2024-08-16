import { displayLoader, fetchJsonResponse } from '../../common/makeRestAPI.js';
import * as SEMI_CONSTANT from './constant.js';
import {
  generateUUID, moveWizardView, urlPath,
} from '../../common/formutils.js';

const {
  CURRENT_FORM_CONTEXT: currentFormContext,
  JOURNEY_NAME: journeyName,
  SEMI_ENDPOINTS: semiEndpoints,
  PRO_CODE,
  DOM_ELEMENT: domElements,
  MISC,
} = SEMI_CONSTANT;

/**
   * generates the journeyId
   * @param {string} visitMode - The visit mode (e.g., "online", "offline").
   * @param {string} journeyAbbreviation - The abbreviation for the journey.
   * @param {string} channel - The channel through which the journey is initiated.
   */
// eslint-disable-next-line no-unused-vars
function generateJourneyId(visitMode, journeyAbbreviation, channel) {
  const dynamicUUID = generateUUID();
  const journeyId = `${dynamicUUID}_01_${journeyAbbreviation}_${visitMode}_${channel}`;
  return journeyId;
}

// Initialize all SEMI Journey Context Variables & formRuntime variables.
currentFormContext.journeyName = journeyName;
currentFormContext.journeyID = generateJourneyId('a', 'b', 'c');

/**
 * generates the otp
 * @param {string} mobileNumber
 * @param {string} cardDigits
 * @param {object} globals
 * @return {PROMISE}
 */
function getOTPV1(mobileNumber, cardDigits, globals) {
  globals.functions.setProperty(globals.form.runtime.journeyId, { value: currentFormContext.journeyID });
  currentFormContext.journeyName = SEMI_CONSTANT.JOURNEY_NAME;
  const jsonObj = {
    requestString: {
      mobileNo: mobileNumber,
      cardNo: cardDigits,
      journeyID: currentFormContext.journeyID,
      journeyName: currentFormContext.journeyName,
    },
  };
  const path = semiEndpoints.otpGen;
  displayLoader();
  return fetchJsonResponse(path, jsonObj, 'POST', true);
}

/**
 * generates the otp
 * @param {string} mobileNumber
 * @param {string} cardDigits
 * @param {object} globals
 * @return {PROMISE}
 */
function otpValV1(mobileNumber, cardDigits, otpNumber) {
  const jsonObj = {
    requestString: {
      mobileNo: mobileNumber,
      cardNo: cardDigits,
      OTP: otpNumber,
      proCode: PRO_CODE,
      journeyID: currentFormContext.journeyID,
      journeyName: currentFormContext.journeyName,
      channel: 'WhatsApp',
    },
  };
  const path = semiEndpoints.otpVal;
  displayLoader();
  return fetchJsonResponse(path, jsonObj, 'POST', true);
}

/*
 * Displays card details by updating the UI with response data.
 * @param {object} globals - global object
 * @param {object} response - response from the checkEligibilty
 */
const cardDisplay = (globals, response) => {
  const creditCardDisplay = globals.form.aem_semicreditCardDisplay;
  globals.functions.setProperty(creditCardDisplay, { visible: true });
  globals.functions.setProperty(creditCardDisplay.aem_semicreditCardContent.aem_customerNameLabel, { value: `Dear ${response?.cardHolderName}` });
  globals.functions.setProperty(creditCardDisplay.aem_semicreditCardContent.aem_outStandingAmt, { value: `${MISC.rupeesUnicode} ${response?.blockCode?.bbvlogn_card_outst}` }); // confirm it ?
  globals.functions.setProperty(globals.form.aem_semicreditCardDisplay.aem_cardfacia, { value: urlPath(response.cardTypePath) });
  const imageEl = document.querySelector(`.field-${globals.form.aem_semicreditCardDisplay.aem_cardfacia.$name} > picture`);
  const imagePath = `${urlPath(response.cardTypePath)}?width=2000&optimize=medium`;
  imageEl?.childNodes[5].setAttribute('src', imagePath);
  imageEl?.childNodes[3].setAttribute('srcset', imagePath);
  imageEl?.childNodes[1].setAttribute('srcset', imagePath);
};

const setTxnListPanelData = (dataList, pannel, globals) => {
  if (dataList?.length) {
    dataList?.forEach((txn, i) => {
      if (i === 0) { /* empty */ } else {
        setTimeout(() => {
          globals.functions.setProperty(pannel[i - 1]?.aem_TxnAmt, { value: txn?.amount });
          globals.functions.setProperty(pannel[i - 1]?.aem_TxnDate, { value: txn?.date });
          globals.functions.setProperty(pannel[i - 1]?.aem_TxnID, { value: txn?.id });
          globals.functions.setProperty(pannel[i - 1]?.billed_TxnName, { value: txn?.name });
          globals.functions.dispatchEvent(pannel, 'addItem');
        }, 20 * (2 * i));
      }
    });
  }
};

/**
* @param {resPayload} Object - checkEligibility response.
* @return {PROMISE}
*/
// eslint-disable-next-line no-unused-vars
function checkELigibilityHandler(resPayload, globals) {
  const ccBilledData = resPayload?.ccBilledTxnResponse?.responseString;
  const ccUnBilledData = resPayload?.ccUnBilledTxnResponse?.responseString;
  // AUTH_CODE, LOGICMOD, PLANNO, STS, amount, date, id, lasttxnseqno, name
  moveWizardView(domElements.semiWizard, domElements.chooseTransaction);
  cardDisplay(globals, resPayload);
  const billedTxnPanel = globals.form.aem_semiWizard.aem_chooseTransactions.billedTxnFragment.aem_chooseTransactions.aem_TxnsList;
  const unBilledTxnPanel = globals.form.aem_semiWizard.aem_chooseTransactions.unbilledTxnFragment.aem_chooseTransactions.aem_TxnsList;
  setTxnListPanelData(ccBilledData, billedTxnPanel, globals);
  setTxnListPanelData(ccUnBilledData, unBilledTxnPanel, globals);
}
export {
  getOTPV1,
  otpValV1,
  checkELigibilityHandler,
};
