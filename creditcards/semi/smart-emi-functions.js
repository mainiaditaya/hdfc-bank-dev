import { displayLoader, fetchJsonResponse } from '../../common/makeRestAPI.js';
import * as SEMI_CONSTANT from './constant.js';
import {
  clearString,
  generateUUID,
  moveWizardView,
  urlPath,
} from '../../common/formutils.js';

import {
  numberToText,
  currencyUtil,
  calculateEMI,
  sortDataByAmount,
  sortDataByAmountSymbol,
  sortByDate,
  changeCheckboxToToggle,
  currencyStrToNum,
} from './semi-utils.js';

const {
  CURRENT_FORM_CONTEXT: currentFormContext,
  JOURNEY_NAME: journeyName,
  SEMI_ENDPOINTS: semiEndpoints,
  PRO_CODE,
  DOM_ELEMENT: domElements,
  MISC,
  DATA_LIMITS,
  // eslint-disable-next-line no-unused-vars
  RESPONSE_PAYLOAD,
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
currentFormContext.totalSelect = 0;
currentFormContext.billed = 0;
currentFormContext.unbilled = 0;
let tnxPopupAlertOnce = 0; // flag alert for the pop to show only once on click of continue
let resendOtpCount = 0;

/**
 * generates the otp
 * @param {string} mobileNumber
 * @param {string} cardDigits
 * @param {string} channel
 * @param {object} globals
 * @return {PROMISE}
 */
function getOTPV1(mobileNumber, cardDigits, channel, globals) {
  /* restrict to show otp-resend option once it reaches max-attemt and to show otptimer */
  const { otpPanel } = globals.form.aem_semiWizard.aem_identifierPanel.aem_otpPanel;
  if (resendOtpCount < DATA_LIMITS.maxOtpResendLimit) {
    globals.functions.setProperty(otpPanel.secondsPanel, { visible: true });
    globals.functions.setProperty(otpPanel.aem_otpResend, { visible: false });
  } else {
    globals.functions.setProperty(otpPanel.secondsPanel, { visible: false });
  }

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
  if (window !== undefined) displayLoader();
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
  if (window !== undefined) displayLoader();
  return fetchJsonResponse(path, jsonObj, 'POST', true);
}

/**
 * pre  execute loan fullfilment process, generated final otp for loan booking
 * @param {string} mobileNumber
 * @param {string} cardDigits
 * @param {object} globals
 * @return {PROMISE}
 */
function preExecution(mobileNumber, cardDigits) {
  const jsonObj = {
    requestString: {
      mobileNo: mobileNumber,
      cardNo: cardDigits,
      encryptedToken: currentFormContext.EligibilityResponse.responseString.records[0].encryptedToken,
      journeyID: currentFormContext.journeyID,
      journeyName: currentFormContext.journeyName,
    },
  };
  const path = semiEndpoints.preexecution;
  if (window !== undefined) displayLoader();
  return fetchJsonResponse(path, jsonObj, 'POST', true);
}
const nfObject = new Intl.NumberFormat('hi-IN');
/**
 * sets the data for the instance of repetable panel
 *
 * @param {object} globals - gobal form object
 * @param {Object} panel - The panel for unbilled transactions.
 * @param {Object} txn - current tramsaction object
 * @param {number} i - current instance of panel row
 */
const setData = (globals, panel, txn, i) => {
  let enabled = true;
  if (currentFormContext.totalSelect === 10 && txn?.aem_Txn_checkBox !== 'on') enabled = false;
  globals.functions.setProperty(panel[i]?.aem_Txn_checkBox, { value: txn?.checkbox || txn?.aem_Txn_checkBox });
  globals.functions.setProperty(panel[i]?.aem_Txn_checkBox, { enabled });// set the checbox value
  const TXN_AMT = `${MISC.rupeesUnicode} ${nfObject.format((txn?.amount || txn?.aem_TxnAmt))}`;
  globals.functions.setProperty(panel[i]?.aem_TxnAmt, { value: TXN_AMT });
  globals.functions.setProperty(panel[i]?.aem_TxnDate, { value: txn?.date || txn?.aem_TxnDate });
  globals.functions.setProperty(panel[i]?.aem_TxnID, { value: txn?.id || txn?.aem_TxnID });
  globals.functions.setProperty(panel[i]?.aem_TxnName, { value: txn?.name || txn?.aem_TxnName });
  globals.functions.setProperty(panel[i]?.authCode, { value: txn?.AUTH_CODE || txn?.aem_TxnName });
  globals.functions.setProperty(panel[i]?.logicMod, { value: txn?.LOGICMOD || txn?.aem_TxnName });
};
/*
 * Displays card details by updating the UI with response data.
 * @param {object} globals - global object
 * @param {object} response - response from the checkEligibilty
 */
const cardDisplay = (globals, response) => {
  const creditCardDisplay = globals.form.aem_semicreditCardDisplay;
  globals.functions.setProperty(creditCardDisplay, { visible: true });
  globals.functions.setProperty(creditCardDisplay.aem_semicreditCardContent.aem_customerNameLabel, { value: `Dear ${response?.cardHolderName}` });
  // eslint-disable-next-line radix
  const totalAmt = nfObject.format(parseInt(response.responseString.creditLimit) - Math.round(parseInt(response?.blockCode?.bbvlogn_card_outst) / 100));
  const TOTAL_OUTSTANDING_AMT = `${MISC.rupeesUnicode} ${totalAmt}`;
  currentFormContext.totalOutstandingAmount = TOTAL_OUTSTANDING_AMT;
  globals.functions.setProperty(creditCardDisplay.aem_semicreditCardContent.aem_outStandingAmt, { value: TOTAL_OUTSTANDING_AMT });
  globals.functions.setProperty(globals.form.aem_semicreditCardDisplay.aem_cardfacia, { value: urlPath(response.cardTypePath) });
  const imageEl = document.querySelector('.field-aem-cardfacia > picture');
  const imagePath = `${urlPath(response.cardTypePath)}?width=2000&optimize=medium`;
  imageEl?.childNodes[5].setAttribute('src', imagePath);
  imageEl?.childNodes[3].setAttribute('srcset', imagePath);
  imageEl?.childNodes[1].setAttribute('srcset', imagePath);
};

const DELAY = 120;
const DELTA_DELAY = 100;

/**
 * Combines transaction data and updates the appropriate panels.
 *
 * @param {Array} allTxn - Array of all transactions.
 * @param {number} [btxn] - Number of billed transactions.
 * @param {Object} billedTxnPanel - The panel for billed transactions.
 * @param {Object} [unBilledTxnPanel] - The panel for unbilled transactions.
 * @param {Object} globals - Global variables and functions.
 */
const setTxnPanelData = (allTxn, btxn, billedTxnPanel, unBilledTxnPanel, globals) => {
  if (!allTxn?.length) return;
  allTxn.forEach((txn, i) => {
    const isBilled = i < btxn;
    const isFirst = i === 0;
    const isLast = i === allTxn.length - 1;
    let panel = billedTxnPanel;
    if (btxn !== undefined && unBilledTxnPanel !== undefined) {
      // Case where we have both billed and unbilled transactions
      panel = isBilled ? billedTxnPanel : unBilledTxnPanel;
    }
    const delay = DELAY + (DELTA_DELAY * i);
    const panelIndex = isBilled ? i : i - btxn;
    setTimeout(() => {
      if (isFirst || !isLast) {
        globals.functions.dispatchEvent(panel, 'addItem');
      }
      setData(globals, panel, txn, panelIndex);
    }, delay);
  });
};

/**
* @param {resPayload} Object - checkEligibility response.
* @param {object} globals - global object
* @return {PROMISE}
*/
// eslint-disable-next-line no-unused-vars
function checkELigibilityHandler(resPayload1, globals) {
  const resPayload = RESPONSE_PAYLOAD.response;
  // const resPayload = resPayload1;
  const response = {};
  try {
    /* continue btn disabling code added temorary, can be removed after form authoring */
    globals.functions.setProperty(globals.form.aem_semiWizard.aem_chooseTransactions.aem_txnSelectionContinue, { enabled: false });
    let ccBilledData = resPayload?.ccBilledTxnResponse?.responseString || [];
    ccBilledData = sortDataByAmount(ccBilledData, 'amount');
    // apply sort by amount here to ccBilledData
    let ccUnBilledData = resPayload?.ccUnBilledTxnResponse?.responseString || [];
    // apply sort by amount here to ccBilledData
    ccUnBilledData = sortDataByAmount(ccUnBilledData, 'amount');
    currentFormContext.EligibilityResponse = resPayload;
    const billedTxnPanel = globals.form.aem_semiWizard.aem_chooseTransactions.billedTxnFragment.aem_chooseTransactions.aem_TxnsList;
    const unBilledTxnPanel = globals.form.aem_semiWizard.aem_chooseTransactions.unbilledTxnFragment.aem_chooseTransactions.aem_TxnsList;
    const allTxn = ccBilledData.concat(ccUnBilledData);
    setTxnPanelData(allTxn, ccBilledData.length, billedTxnPanel, unBilledTxnPanel, globals);
    globals.functions.setProperty(globals.form.aem_semiWizard.aem_chooseTransactions.aem_transactionsInfoPanel.aem_eligibleTxnLabel, { value: `Eligible Transactions (${allTxn?.length})` });
    globals.functions.setProperty(globals.form.aem_semiWizard.aem_chooseTransactions.billedTxnFragment.aem_chooseTransactions.aem_txnHeaderPanel.aem_TxnAvailable, { value: `Billed Transaction: (${ccBilledData?.length})` });
    globals.functions.setProperty(globals.form.aem_semiWizard.aem_chooseTransactions.unbilledTxnFragment.aem_chooseTransactions.aem_txnHeaderPanel.aem_TxnAvailable, { value: `Unbilled Transaction: (${ccUnBilledData?.length})` });
    // set runtime values
    globals.functions.setProperty(globals.form.runtime.originAcct, { value: currentFormContext.EligibilityResponse.responseString.aanNumber });
    // Display card and move wizard view
    if (window !== undefined) cardDisplay(globals, resPayload);
    if (window !== undefined) moveWizardView(domElements.semiWizard, domElements.chooseTransaction);
    response.nextscreen = 'success';
    return response;
  } catch (error) {
    response.nextscreen = 'failure';
    return response;
  }
}

const getLoanOptionsInfo = (responseStringJsonObj) => {
  // Loop through the periods, interests, and tids
  const keyPosInResponse = [1, 2, 3, 4, 5];
  const loanoptions = keyPosInResponse.map((el) => {
    const periodKey = `period${el === 1 ? '' : el}`;
    const interestKey = `interest${el === 1 ? '' : el}`;
    const tidKey = `tid${el === 1 ? '' : el}`;
    if (responseStringJsonObj[0][periodKey] !== undefined);
    return {
      period: responseStringJsonObj[0][periodKey],
      interest: responseStringJsonObj[0][interestKey],
      tid: responseStringJsonObj[0][tidKey],
      processingFee: responseStringJsonObj[0].memoLine1,
    };
  });
  return loanoptions;
};

/**
 * Sets the data for a specific tenure panel option
 * @param {object} globals - globals form object
 * @param {Array} panel - The array of tenure selection panels.
 * @param {object} option - option object containing details of emi, processing fee, roi
 * @param {number} i -The index of the current tenure
 */
const setDataTenurePanel = (globals, panel, option, i) => {
  globals.functions.setProperty(panel[i].aem_tenureSelection, { enumNames: [option?.period] });
  // globals.functions.setProperty(globals.form.aem_semiWizard.aem_selectTenure.test, { enum: [0], enumNames: ['test'] });
  // globals.functions.setProperty(panel[i].aem_tenureSelection, { enum: [0], enumNames: [option?.period] });
  /* */
  // const monthlyEmi = `${MISC.rupeesUnicode} ${Number(clearString(option?.monthlyEMI))}`;
  // const processingFees = `${MISC.rupeesUnicode} ${option?.procesingFee}`;
  const emiAmt = `${MISC.rupeesUnicode} ${nfObject.format(Number(clearString(option?.monthlyEMI)))}`;
  const procesFees = `${MISC.rupeesUnicode} ${nfObject.format(option?.procesingFee)}`;
  globals.functions.setProperty(panel[i].aem_tenureSelectionEmi, { value: emiAmt });
  globals.functions.setProperty(panel[i].aem_tenureSelectionProcessing, { value: procesFees });
  globals.functions.setProperty(panel[i].aem_roi_monthly, { value: option?.roiMonthly });
  globals.functions.setProperty(panel[i].aem_roi_annually, { value: option?.roiAnnually });
  /* emi substance incldes tid, period, interest without parsed which required for ccSmart emi payload */
  const emiSubstance = JSON.stringify(option?.emiSubStance);
  globals.functions.setProperty(panel[i].aem_tenureRawData, { value: emiSubstance });
};

const tenureOption = (loanOptions, loanAmt) => {
  const arrayOptions = loanOptions?.map((option) => {
    const roiMonthly = (parseInt(option.interest, 10) / 100) / 12;
    const roiAnnually = currencyUtil(parseFloat(option?.interest), 2);
    const monthlyEMI = nfObject.format(calculateEMI(loanAmt, roiMonthly, parseInt(option.period, 10)));
    const period = `${parseInt(option.period, 10)} Months`;
    const procesingFee = nfObject.format(option.processingFee);
    const emiSubStance = option;
    return ({
      ...option,
      procesingFee,
      period,
      monthlyEMI,
      roiAnnually,
      roiMonthly,
      emiSubStance,
    });
  });
  return arrayOptions;
};

/**
 * Updates the UI to display the selected transaction amount for SmartEMI and pre-selects the last tenure option.
 * @param {object} globals - global form object
 */
const tenureDisplay = (globals) => {
  const tenureRepatablePanel = globals.form.aem_semiWizard.aem_selectTenure.aem_tenureSelectionMainPnl.aem_tenureSelectionRepeatablePanel;
  const semiFormData = globals.functions.exportData().smartemi;
  const selectedTxnList = (semiFormData?.aem_billedTxn?.aem_billedTxnSelection?.concat(semiFormData?.aem_unbilledTxn?.aem_unbilledTxnSection))?.filter((txn) => txn.aem_Txn_checkBox === 'on');
  const totalAmountOfTxn = selectedTxnList?.reduce((prev, acc) => prev + parseFloat(acc.aem_TxnAmt.replace(/[^\d.-]/g, '')), 0);
  // set total amount for the review screen in whatsapp.
  globals.functions.setProperty(globals.form.aem_semiWizard.aem_selectTenure.reviewDetailsView.aem_reviewAmount, { value: totalAmountOfTxn });
  const totalAmountSelected = (parseInt(totalAmountOfTxn, 10));
  const loanArrayOption = getLoanOptionsInfo(currentFormContext.EligibilityResponse?.responseString?.records);
  const tenureArrayOption = tenureOption(loanArrayOption, totalAmountSelected);
  const LABEL_AMT_SELCTED = 'Amount selected for SmartEMI';
  const DISPLAY_TOTAL_AMT = `${MISC.rupeesUnicode} ${nfObject.format(totalAmountSelected)}`;
  const TOTAL_AMT_IN_WORDS = `${numberToText(totalAmountOfTxn)}`;
  /* display amount */
  globals.functions.setProperty(globals.form.aem_semicreditCardDisplay.aem_semicreditCardContent.aem_customerNameLabel, { value: LABEL_AMT_SELCTED });
  globals.functions.setProperty(globals.form.aem_semicreditCardDisplay.aem_semicreditCardContent.aem_outStandingLabel, { value: DISPLAY_TOTAL_AMT });
  globals.functions.setProperty(globals.form.aem_semicreditCardDisplay.aem_semicreditCardContent.aem_outStandingAmt, { value: `${MISC.rupeesUnicode} ${TOTAL_AMT_IN_WORDS}` });
  /* pre-select the last tenure option (radio btn) by default */
  const DEFUALT_SELCT_TENURE = (tenureRepatablePanel.length > 0) ? (tenureRepatablePanel.length - 1) : 0;
  globals.functions.setProperty(tenureRepatablePanel[DEFUALT_SELCT_TENURE].aem_tenureSelection, { value: '0' });
  /* discount */
  // const discount = globals.form.aem_semiWizard.aem_selectTenure.discount.$value; ///
  // const calcDiscount = ((Number().toFixed(2)) - (Number(discount) / 100));
  // globals.functions.setProperty(globals.form.aem_semiWizard.aem_selectTenure.discount, { value: calcDiscount });
  /* set data for tenure panel */
  tenureArrayOption?.forEach((option, i) => {
    setDataTenurePanel(globals, tenureRepatablePanel, option, i);
  });
};

/**
 * Continue button on choose transactions.
 *
 * @param {Object} globals - Global variables and functions.
 */
function selectTenure(globals) {
  if (currentFormContext.totalSelect < DATA_LIMITS.totalSelectLimit) {
    tnxPopupAlertOnce += 1;
  }
  if ((tnxPopupAlertOnce === 1)) { // option of selecting ten txn alert should be occured only once.
    globals.functions.setProperty(globals.form.aem_semiWizard.aem_chooseTransactions.aem_txtSelectionPopupWrapper, { visible: true });
    globals.functions.setProperty(globals.form.aem_semiWizard.aem_chooseTransactions.aem_txtSelectionPopupWrapper.aem_txtSelectionPopup, { visible: true });
  } else if (window !== undefined) {
    moveWizardView(domElements.semiWizard, domElements.selectTenure);
    tenureDisplay(globals);
  }
}
let selectTopTenFlag = false;
let isUserSelection = false;
/**
 * function sorts the billed / Unbilled Txn  array in based on the orderBy field
 * @param {string} txnType  - BILLED /  UNBILLED
 * @param {string} orderBy - orderby amount or date
 */
function sortData(txnType, orderBy, globals) {
  isUserSelection = !isUserSelection;
  if (!txnType) return;
  // orderBy - 0 - amount ; 1 - date
  const BILLED_FRAG = 'billedTxnFragment';
  const UNBILLED_FRAG = 'unbilledTxnFragment';
  const TXN_FRAG = txnType === 'BILLED' ? BILLED_FRAG : UNBILLED_FRAG;
  const pannel = globals.form.aem_semiWizard.aem_chooseTransactions?.[`${TXN_FRAG}`].aem_chooseTransactions.aem_TxnsList;
  const billed = globals.functions.exportData().smartemi.aem_billedTxn.aem_billedTxnSelection;
  const unBilled = globals.functions.exportData().smartemi.aem_unbilledTxn.aem_unbilledTxnSection;
  const dataTxnList = txnType === 'BILLED' ? billed : unBilled;
  const sortedData = (orderBy === '0') ? sortDataByAmountSymbol(dataTxnList) : sortByDate(dataTxnList);
  const mapSortedDat = sortedData?.map((item) => ({
    ...item,
    aem_TxnAmt: (currencyStrToNum(item?.aem_TxnAmt)),
  }));
  mapSortedDat?.forEach((data, i) => setData(globals, pannel, data, i));
  setTimeout(() => {
    isUserSelection = !isUserSelection;
  }, 1000);
}

/**
 * disable the unselected fields of transaction from billed or unbilled.
 * @param {Array} txnList - array of repeatable pannel
 * @param {boolean} allCheckBoxes - array of repeatable pannel
 * @param {object} globals - global object
 */
const disableCheckBoxes = (txnList, allCheckBoxes, globals) => {
  if (allCheckBoxes)isUserSelection = !isUserSelection;
  txnList?.forEach((item) => {
    if (item.aem_Txn_checkBox.$value === 'on' && !allCheckBoxes) {
      globals.functions.setProperty(item.aem_Txn_checkBox, { enabled: true });
    } else {
      globals.functions.setProperty(item.aem_Txn_checkBox, { value: undefined });
      globals.functions.setProperty(item.aem_Txn_checkBox, { enabled: false });
    }
  });
};

/**
 * enable all fields of transaction from billed or unbilled.
 * @param {Array} txnList - array of repeatable pannel
 * @param {object} globals - global object
 */
const enableAllTxnFields = (txnList, globals) => txnList?.forEach((list) => globals.functions.setProperty(list.aem_Txn_checkBox, { enabled: true }));

/**
 * function to update number of transaction selected.
 * @param {string} checkboxVal - checkbox value
 * @param {string} txnType - BILLED /  UNBILLED
* @param {object} globals - globals form object
 */
function txnSelectHandler(checkboxVal, txnType, globals) {
  // null || ON
  if (selectTopTenFlag || isUserSelection) return;
  const MAX_SELECT = 10;
  const BILLED_FRAG = 'billedTxnFragment';
  const UNBILLED_FRAG = 'unbilledTxnFragment';
  const TXN_FRAG = txnType === 'BILLED' ? BILLED_FRAG : UNBILLED_FRAG;

  const txnList = globals.form.aem_semiWizard.aem_chooseTransactions?.[`${TXN_FRAG}`].aem_chooseTransactions.aem_TxnsList;
  const txnSelected = globals.form.aem_semiWizard.aem_chooseTransactions?.[`${TXN_FRAG}`].aem_chooseTransactions.aem_txnHeaderPanel.aem_txnSelected;
  const selectedList = txnList?.filter((el) => (el.aem_Txn_checkBox.$value === 'on'));
  const SELECTED = `${selectedList?.length} Selected`;
  globals.functions.setProperty(txnSelected, { value: SELECTED }); // set number of select in billed or unbilled txn list
  if ((checkboxVal === 'on') && ((txnType === 'BILLED') || (txnType === 'UNBILLED'))) {
    currentFormContext.totalSelect += 1;
  } else if ((currentFormContext.totalSelect > 0)) {
    currentFormContext.totalSelect -= 1;
  }
  const TOTAL_SELECT = `Total selected ${currentFormContext.totalSelect}/${MAX_SELECT}`;

  const billedTxnList = globals.form.aem_semiWizard.aem_chooseTransactions.billedTxnFragment.aem_chooseTransactions.aem_TxnsList;
  const unbilledTxnList = globals.form.aem_semiWizard.aem_chooseTransactions.unbilledTxnFragment.aem_chooseTransactions.aem_TxnsList;

  if ((currentFormContext.totalSelect <= MAX_SELECT)) {
    globals.functions.setProperty(globals.form.aem_semiWizard.aem_chooseTransactions.aem_transactionsInfoPanel.aem_TotalSelectedTxt, { value: TOTAL_SELECT });// total no of select billed or unbilled txn list
  }

  if (currentFormContext.totalSelect < MAX_SELECT) {
    /* enabling selected fields in case disabled */
    enableAllTxnFields(unbilledTxnList, globals);
    enableAllTxnFields(billedTxnList, globals);
  }
  if ((currentFormContext.totalSelect === MAX_SELECT)) {
    /* popup alert hanldles */
    const CONFIRM_TXT = 'You can select up to 10 transactions at a time, but you can repeat the process to convert more transactions into SmartEMI.';
    globals.functions.setProperty(globals.form.aem_semiWizard.aem_chooseTransactions.aem_txtSelectionPopupWrapper, { visible: true });
    globals.functions.setProperty(globals.form.aem_semiWizard.aem_chooseTransactions.aem_txtSelectionPopupWrapper.aem_txtSelectionPopup, { visible: true });
    globals.functions.setProperty(globals.form.aem_semiWizard.aem_chooseTransactions.aem_txtSelectionPopupWrapper.aem_txtSelectionPopup.aem_txtSelectionConfirmation, { value: CONFIRM_TXT });
    globals.functions.setProperty(globals.form.aem_semiWizard.aem_chooseTransactions.aem_txtSelectionPopupWrapper.aem_txtSelectionPopup.aem_txtSelectionConfirmation1, { visible: true });
    /* disabling unselected checkBoxes */
    disableCheckBoxes(unbilledTxnList, false, globals);
    disableCheckBoxes(billedTxnList, false, globals);
  }
  /* enable disable select-tenure continue button */
  if (currentFormContext.totalSelect === 0) {
    globals.functions.setProperty(globals.form.aem_semiWizard.aem_chooseTransactions.aem_txnSelectionContinue, { enabled: false });
  } else if (currentFormContext.totalSelect > 0) {
    globals.functions.setProperty(globals.form.aem_semiWizard.aem_chooseTransactions.aem_txnSelectionContinue, { enabled: true });
  }
}

/**
 * calls function to add styling to completed steppers
 *
 * @function changeWizardView
 * @returns {void}
 */
const changeWizardView = () => {
  const completedStep = document.querySelector('.field-aem-semiwizard .wizard-menu-items .wizard-menu-active-item');
  completedStep.classList.add('wizard-completed-item');
};

/**
   * Switches the visibility of panels in the card wizard interface.
   * @name semiWizardSwitch to switch panel visibility
   * @param {string} source -  The source of the card wizard (e.g., 'aem_semiWizard' - parent).
   * @param {string} target -  The target panel to switch to (e.g., 'aem_selectTenure' or 'aem_chooseTransactions').
   * @param {string} current-  The current view before switching.
   * @param {object} global -  global form object
   * @returns {void}
   */
const semiWizardSwitch = (source, target, current, globals) => {
  /* reset the value of card display while coming back from tenure section */
  if ((target === domElements.chooseTransaction) && (current === domElements.selectTenure)) {
    const LABEL_OUTSTANDING_AMT = 'Your Total Outstanding Amount is';
    const CUST_NAME_LABEL = `Dear ${currentFormContext.EligibilityResponse?.cardHolderName}`;
    const TOTAL_OUTSTANDING_AMT = currentFormContext.totalOutstandingAmount;
    globals.functions.setProperty(globals.form.aem_semicreditCardDisplay.aem_semicreditCardContent.aem_customerNameLabel, { value: CUST_NAME_LABEL });
    globals.functions.setProperty(globals.form.aem_semicreditCardDisplay.aem_semicreditCardContent.aem_outStandingAmt, { value: TOTAL_OUTSTANDING_AMT });
    globals.functions.setProperty(globals.form.aem_semicreditCardDisplay.aem_semicreditCardContent.aem_outStandingLabel, { value: LABEL_OUTSTANDING_AMT });
  }
  return (window !== undefined) && moveWizardView(source, target);
};

/**
 * select top txnlist
* @param {object} globals - global object
 */
function selectTopTxn(globals) {
  selectTopTenFlag = !selectTopTenFlag;
  const SELECT_TOP_TXN_LIMIT = 10;
  const billedTxnPanel = globals.form.aem_semiWizard.aem_chooseTransactions.billedTxnFragment.aem_chooseTransactions.aem_TxnsList;
  const unBilledTxnPanel = globals.form.aem_semiWizard.aem_chooseTransactions.unbilledTxnFragment.aem_chooseTransactions.aem_TxnsList;
  const billed = globals.functions.exportData().smartemi.aem_billedTxn.aem_billedTxnSelection;
  const unBilled = globals.functions.exportData().smartemi.aem_unbilledTxn.aem_unbilledTxnSection;

  const allTxn = billed.concat(unBilled);
  const sortedArr = sortDataByAmountSymbol(allTxn);
  const sortedTxnList = sortedArr?.slice(0, SELECT_TOP_TXN_LIMIT);
  let billedCounter = 0;
  let unbilledCounter = 0;
  let unbilledCheckedItems = 0;
  let billedCheckedItems = 0;
  let value = 'on';
  let enabled = true;

  sortedArr?.forEach((txn, i) => {
    if (i > 9) {
      value = undefined;
      enabled = false;
    }
    if (txn.aem_txn_type === 'UNBILLED') {
      globals.functions.setProperty(unBilledTxnPanel[unbilledCounter].aem_Txn_checkBox, { enabled });
      globals.functions.setProperty(unBilledTxnPanel[unbilledCounter].aem_Txn_checkBox, { value });
      if (i <= 9) unbilledCheckedItems += 1;
      unbilledCounter += 1;
    } else {
      globals.functions.setProperty(billedTxnPanel[billedCounter].aem_Txn_checkBox, { enabled });
      globals.functions.setProperty(billedTxnPanel[billedCounter].aem_Txn_checkBox, { value });
      if (i <= 9) billedCheckedItems += 1;
      billedCounter += 1;
    }
    const billedTxnSelected = globals.form.aem_semiWizard.aem_chooseTransactions?.billedTxnFragment.aem_chooseTransactions.aem_txnHeaderPanel.aem_txnSelected;
    const unbilledTxnSelected = globals.form.aem_semiWizard.aem_chooseTransactions?.unbilledTxnFragment.aem_chooseTransactions.aem_txnHeaderPanel.aem_txnSelected;
    globals.functions.setProperty(billedTxnSelected, { value: `${billedCheckedItems} Selected` });
    globals.functions.setProperty(unbilledTxnSelected, { value: `${unbilledCheckedItems} Selected` });
    currentFormContext.totalSelect = sortedTxnList.length;
    const TOTAL_SELECT = `Total selected ${currentFormContext.totalSelect}/${sortedTxnList.length}`;
    globals.functions.setProperty(globals.form.aem_semiWizard.aem_chooseTransactions.aem_transactionsInfoPanel.aem_TotalSelectedTxt, { value: TOTAL_SELECT });
  });
  globals.functions.setProperty(globals.form.aem_semiWizard.aem_chooseTransactions.aem_txnSelectionContinue, { enabled: true });
  setTimeout(() => {
    selectTopTenFlag = !selectTopTenFlag;
  }, 1000);
}

/**
* Commits the selected radio button value and updates the UI with the corresponding rate of interest.
* @param {object} arg1
* @param {object} globals - global object
*/
function radioBtnValCommit(arg1, globals) {
  if (arg1?.$value) {
    const selectedQlyFormValue = arg1?.$qualifiedName?.substring(1); // "form.aem_semiWizard.aem_selectTenure.aem_tenureSelectionMainPnl.aem_tenureSelectionRepeatablePanel[2].aem_tenureSelection"
    const selectedIndex = Number(selectedQlyFormValue?.match(/\d+/g)?.[0]); // 0, 1, 2 or 3 indicates the index of the selected
    const radioBtnOption = globals.form.aem_semiWizard.aem_selectTenure.aem_tenureSelectionMainPnl.aem_tenureSelectionRepeatablePanel;
    const tenureData = globals.functions.exportData().aem_tenureSelectionRepeatablePanel;
    radioBtnOption?.forEach((item, i) => {
      if (selectedIndex === i) {
        globals.functions.setProperty(item.aem_tenureSelection, { value: '0' });
        /* set roi based on radio select */
        const roiMonthly = `${Number(tenureData[i].aem_roi_monthly).toFixed(2)} %`;
        const roiAnnually = `${tenureData[i].aem_roi_annually}% per annum`;
        globals.functions.setProperty(globals.form.aem_semiWizard.aem_selectTenure.aem_ROI, { value: roiMonthly });
        globals.functions.setProperty(globals.form.aem_semiWizard.aem_selectTenure.rateOfInterestPerAnnumValue, { value: roiAnnually });
        // set the same data for review panel screen - whatsapp flow.
        const rawTenureData = JSON.parse(tenureData[i].aem_tenureRawData);
        const duration = `${parseInt(rawTenureData.period, 10)} Months`;
        globals.functions.setProperty(globals.form.aem_semiWizard.aem_selectTenure.reviewDetailsView.aem_monthlyEmi, { value: tenureData[i].aem_tenureSelectionEmi });
        globals.functions.setProperty(globals.form.aem_semiWizard.aem_selectTenure.reviewDetailsView.aem_duration, { value: duration });
        globals.functions.setProperty(globals.form.aem_semiWizard.aem_selectTenure.reviewDetailsView.aem_roi, { value: roiMonthly });
        globals.functions.setProperty(globals.form.aem_semiWizard.aem_selectTenure.reviewDetailsView.aem_processingFee, { value: tenureData[i].aem_tenureSelectionProcessing });

        /* discount */
        const discount = globals.form.aem_semiWizard.aem_selectTenure.discount.$value; ///
        const calcDiscount = ((Number(tenureData[i].aem_roi_monthly).toFixed(2)) - (Number(discount) / 100));
        globals.functions.setProperty(globals.form.aem_semiWizard.aem_selectTenure.discount, { value: calcDiscount });
      } else {
        globals.functions.setProperty(item.aem_tenureSelection, { value: null });
      }
    });
  }
}

/**
 * Generates an EMI conversion array option for the ccsmart API payload.
 * @param {object} globals - global form object
 * @returns {Array<Object>}
 */
const getEmiArrayOption = (globals) => {
  const semiFormData = globals.functions.exportData().smartemi;
  const selectedTxnList = (semiFormData?.aem_billedTxn?.aem_billedTxnSelection?.concat(semiFormData?.aem_unbilledTxn?.aem_unbilledTxnSection))?.filter((txn) => txn.aem_Txn_checkBox === 'on');
  const CARD_SEQ = globals.form.runtime.cardSeq.$value;
  const PLAN = globals.form.runtime.plan.$value;
  const ORIG_ACCOUNT = globals.form.runtime.originAcct.$value || currentFormContext.EligibilityResponse.responseString.aanNumber;
  const mappedTxnArray = selectedTxnList?.map(((el) => ({
    authCode: el?.authCode ?? '',
    cardSeq: CARD_SEQ,
    effDate: clearString(el?.aem_TxnDate),
    logicMod: el?.logicMod,
    itemNbr: el?.aem_TxnID,
    tranAmt: currencyStrToNum(el?.aem_TxnAmt),
    txnDesc: el?.aem_txn_type,
    plan: PLAN,
    originAcct: ORIG_ACCOUNT,
  })));
  return mappedTxnArray;
};

/**
 * Generates and sends an EMI conversion request payload for the ccsmart API.
 * @param {string} mobileNum - mobile number
 * @param {string} cardNum - card digit number
 * @param {string} otpNum - otp number
 * @param {object} globals - globals form object
 * @returns {Promise<Object>} - A promise that resolves to the JSON response from the ccsmart API.
 */
const getCCSmartEmi = (mobileNum, cardNum, otpNum, globals) => {
  const AGENCY_CODE = 'Adobe Webforms';
  const MEM_CATEGORY = 'Adobe Webforms';
  const MEM_SUB_CAT = 'Adobe';
  const MEMO_LINE_4 = 'Adobe';
  const MEMO_LINE_5 = 'Adobe';
  const LTR_EXACT_CODE = 'Y  ';
  const DEPT = 'IT';
  const PROC_FEES = '000'; // String(currencyStrToNum(selectedTenurePlan?.aem_tenureSelectionProcessing)) - actual process Fee in display
  const emiConversionArray = getEmiArrayOption(globals);
  const REQ_NBR = String(emiConversionArray?.length === 1) ? ((String(emiConversionArray?.length)).padStart(2, '0')) : (String(emiConversionArray?.length)); // format '01'? or '1'
  const paiseDecimal = '00';
  const LOAN_AMOUNT = String(emiConversionArray?.reduce((prev, acc) => prev + acc.tranAmt, 0)) + paiseDecimal;
  const eligibiltyResponse = currentFormContext.EligibilityResponse;
  const tenurePlan = globals.functions.exportData().aem_tenureSelectionRepeatablePanel;
  const selectedTenurePlan = tenurePlan?.find((emiPlan) => emiPlan.aem_tenureSelection === '0');
  const emiSubData = JSON.parse(selectedTenurePlan?.aem_tenureRawData);
  const INTEREST = emiSubData?.interest; // '030888'
  const TENURE = (parseInt(emiSubData?.period, 10).toString().length === 1) ? (parseInt(emiSubData?.period, 10).toString().padStart(2, '0')) : parseInt(emiSubData?.period, 10).toString(); // '003' into '03' / '18'-'18'
  const TID = emiSubData?.tid; // '000000101'
  const jsonObj = {
    requestString: {
      cardNo: cardNum,
      OTP: otpNum,
      proCode: PRO_CODE,
      prodId: eligibiltyResponse.responseString.records[0].prodId,
      agencyCode: AGENCY_CODE,
      tenure: TENURE,
      interestRate: INTEREST,
      encryptedToken: eligibiltyResponse.responseString.records[0].encryptedToken,
      loanAmt: LOAN_AMOUNT,
      ltrExctCode: LTR_EXACT_CODE,
      caseNumber: mobileNum,
      dept: DEPT,
      memCategory: MEM_CATEGORY,
      memSubCat: MEM_SUB_CAT,
      memoLine4: MEMO_LINE_4,
      memoLine5: MEMO_LINE_5,
      mobileNo: mobileNum,
      tid: TID,
      reqAmt: LOAN_AMOUNT,
      procFeeWav: PROC_FEES,
      reqNbr: REQ_NBR,
      emiConversion: emiConversionArray,
      journeyID: currentFormContext.journeyID,
      journeyName: currentFormContext.journeyName,
      userAgent: window.navigator.userAgent,
    },
  };
  const path = semiEndpoints.ccSmartEmi;
  if (window !== undefined) displayLoader();
  return fetchJsonResponse(path, jsonObj, 'POST', true);
};

/**
 * otp timer logic to handle based on the screen of otp
 * @param {string} - otp pannel - firstotp or secondotp
 * @param {object} globals - global form object
 */
const otpTimerV1 = (pannelName, globals) => {
  let sec = DATA_LIMITS.otpTimeLimit;
  let dispSec = DATA_LIMITS.otpTimeLimit;
  let otpPanel;
  const FIRST_PANNEL_OTP = 'firstotp';
  if (pannelName === FIRST_PANNEL_OTP) {
    otpPanel = globals.form.aem_semiWizard.aem_identifierPanel.aem_otpPanel.otpPanel;
  }
  const timer = setInterval(() => {
    globals.functions.setProperty(otpPanel.secondsPanel.seconds, { value: dispSec });
    sec -= 1;
    dispSec = sec;
    if (sec < 10) {
      dispSec = `0${dispSec}`;
    }
    if (sec < 0) {
      clearInterval(timer);
      globals.functions.setProperty(otpPanel.secondsPanel, { visible: false });
      if (resendOtpCount < DATA_LIMITS.maxOtpResendLimit) {
        globals.functions.setProperty(
          otpPanel.aem_otpResend,
          { visible: true },
        );
      }
    }
  }, 1000);
};

/**
 * @name resendOTP
 * @param {Object} globals - The global object containing necessary data for DAP request.
 * @return {PROMISE}
 */
const resendOTP = async (globals) => {
  const channel = 'web';
  const mobileNumber = globals.form.aem_semiWizard.aem_identifierPanel.aem_loginPanel.mobilePanel.aem_mobileNum.$value;
  const cardDigits = globals.form.aem_semiWizard.aem_identifierPanel.aem_loginPanel.aem_cardNo.$value;
  const { otpPanel } = globals.form.aem_semiWizard.aem_identifierPanel.aem_otpPanel;

  if (resendOtpCount < DATA_LIMITS.maxOtpResendLimit) {
    resendOtpCount += 1;
    if (resendOtpCount === DATA_LIMITS.maxOtpResendLimit) {
      globals.functions.setProperty(otpPanel.secondsPanel, { visible: false });
      globals.functions.setProperty(otpPanel.aem_otpResend, { visible: false });
      globals.functions.setProperty(otpPanel.aem_maxlimitOTP, { visible: true });
    }
    return getOTPV1(mobileNumber, cardDigits, channel, globals);
  }

  return null;
};

export {
  getOTPV1,
  otpValV1,
  checkELigibilityHandler,
  selectTenure,
  sortData,
  selectTopTxn,
  txnSelectHandler,
  changeCheckboxToToggle,
  changeWizardView,
  preExecution,
  radioBtnValCommit,
  semiWizardSwitch,
  getCCSmartEmi,
  otpTimerV1,
  resendOTP,
};
