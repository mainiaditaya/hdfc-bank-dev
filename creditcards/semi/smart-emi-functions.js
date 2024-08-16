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
  globals.functions.setProperty(creditCardDisplay.image1723123046525, { value: urlPath(response.cardTypePath) });
  const imageEl = document.querySelector(`.field-${creditCardDisplay.image1723123046525.$name} > picture`);
  const imagePath = `${urlPath(response.cardTypePath)}?width=2000&optimize=medium`;
  imageEl?.childNodes[5].setAttribute('src', imagePath);
  imageEl?.childNodes[3].setAttribute('srcset', imagePath);
  imageEl?.childNodes[1].setAttribute('srcset', imagePath);
};

/**
* @param {resPayload} Object - checkEligibility response.
* @return {PROMISE}
*/
// eslint-disable-next-line no-unused-vars
function checkELigibilityHandler(resPayload, globals) {
  resPayload = {
    response: {
      blockCode: {
        bbvlogn_card_outst: ' 00000000555929',
        billingCycle: '19',
        cardNumber: '1012350000002124',
      },
      address: {
        city: 'JALPAIGURI',
        postalCode: '745202',
        name: 'TEST FLOTRAPI TEST FLOTRAPI',
        addressLine1: 'TESTING TESTING TESTING XX',
        addressLine2: 'TEST TEST TEST TEST12',
        addressLine3: 'TESTING TESTING123',
        state: 'WB',
        addressLine4: '',
      },
      ccBilledTxnResponse: {
        responseString: [
          {
            date: '19-02-2021',
            amount: 4500,
            AUTH_CODE: '',
            STS: 'N',
            LOGICMOD: '1',
            name: '20 BILLED TXN',
            lasttxnseqno: '22',
            id: '90200',
            PLANNO: '10002',
          },
          {
            date: '19-02-2021',
            amount: 4400,
            AUTH_CODE: '',
            STS: 'N',
            LOGICMOD: '1',
            name: '20 BILLED TXN',
            lasttxnseqno: '21',
            id: '90192',
            PLANNO: '10002',
          },
          {
            date: '19-02-2021',
            amount: 4300,
            AUTH_CODE: '',
            STS: 'N',
            LOGICMOD: '1',
            name: '20 BILLED TXN',
            lasttxnseqno: '20',
            id: '90184',
            PLANNO: '10002',
          },
          {
            date: '19-02-2021',
            amount: 4200,
            AUTH_CODE: '',
            STS: 'N',
            LOGICMOD: '1',
            name: '20 BILLED TXN',
            lasttxnseqno: '19',
            id: '90176',
            PLANNO: '10002',
          },
          {
            date: '19-02-2021',
            amount: 4100,
            AUTH_CODE: '',
            STS: 'N',
            LOGICMOD: '1',
            name: '20 BILLED TXN',
            lasttxnseqno: '18',
            id: '90168',
            PLANNO: '10002',
          },
          {
            date: '19-02-2021',
            amount: 4000,
            AUTH_CODE: '',
            STS: 'N',
            LOGICMOD: '1',
            name: '20 BILLED TXN',
            lasttxnseqno: '17',
            id: '90150',
            PLANNO: '10002',
          },
          {
            date: '19-02-2021',
            amount: 3900,
            AUTH_CODE: '',
            STS: 'N',
            LOGICMOD: '1',
            name: '20 BILLED TXN',
            lasttxnseqno: '16',
            id: '90143',
            PLANNO: '10002',
          },
          {
            date: '19-02-2021',
            amount: 3800,
            AUTH_CODE: '',
            STS: 'N',
            LOGICMOD: '1',
            name: '20 BILLED TXN',
            lasttxnseqno: '15',
            id: '90135',
            PLANNO: '10002',
          },
          {
            date: '19-02-2021',
            amount: 3700,
            AUTH_CODE: '',
            STS: 'N',
            LOGICMOD: '1',
            name: '20 BILLED TXN',
            lasttxnseqno: '14',
            id: '90127',
            PLANNO: '10002',
          },
          {
            date: '19-02-2021',
            amount: 3600,
            AUTH_CODE: '',
            STS: 'N',
            LOGICMOD: '1',
            name: '20 BILLED TXN',
            lasttxnseqno: '13',
            id: '90119',
            PLANNO: '10002',
          },
          {
            date: '19-02-2021',
            amount: 3500,
            AUTH_CODE: '',
            STS: 'N',
            LOGICMOD: '1',
            name: '20 BILLED TXN',
            lasttxnseqno: '12',
            id: '90101',
            PLANNO: '10002',
          },
          {
            date: '19-02-2021',
            amount: 3400,
            AUTH_CODE: '',
            STS: 'N',
            LOGICMOD: '1',
            name: '20 BILLED TXN',
            lasttxnseqno: '11',
            id: '90093',
            PLANNO: '10002',
          },
          {
            date: '19-02-2021',
            amount: 3300,
            AUTH_CODE: '',
            STS: 'N',
            LOGICMOD: '1',
            name: '20 BILLED TXN',
            lasttxnseqno: '10',
            id: '90085',
            PLANNO: '10002',
          },
          {
            date: '19-02-2021',
            amount: 3200,
            AUTH_CODE: '',
            STS: 'N',
            LOGICMOD: '1',
            name: '20 BILLED TXN',
            lasttxnseqno: '9',
            id: '90077',
            PLANNO: '10002',
          },
          {
            date: '19-02-2021',
            amount: 3100,
            AUTH_CODE: '',
            STS: 'N',
            LOGICMOD: '1',
            name: '20 BILLED TXN',
            lasttxnseqno: '8',
            id: '90069',
            PLANNO: '10002',
          },
          {
            date: '19-02-2021',
            amount: 3000,
            AUTH_CODE: '',
            STS: 'N',
            LOGICMOD: '1',
            name: '20 BILLED TXN',
            lasttxnseqno: '7',
            id: '90051',
            PLANNO: '10002',
          },
          {
            date: '19-02-2021',
            amount: 2900,
            AUTH_CODE: '',
            STS: 'N',
            LOGICMOD: '1',
            name: '20 BILLED TXN',
            lasttxnseqno: '6',
            id: '90044',
            PLANNO: '10002',
          },
          {
            date: '19-02-2021',
            amount: 2800,
            AUTH_CODE: '',
            STS: 'N',
            LOGICMOD: '1',
            name: '20 BILLED TXN',
            lasttxnseqno: '5',
            id: '90036',
            PLANNO: '10002',
          },
          {
            date: '19-02-2021',
            amount: 2700,
            AUTH_CODE: '',
            STS: 'N',
            LOGICMOD: '1',
            name: '20 BILLED TXN',
            lasttxnseqno: '4',
            id: '90028',
            PLANNO: '10002',
          },
          {
            date: '19-02-2021',
            amount: 2600,
            AUTH_CODE: '',
            STS: 'N',
            LOGICMOD: '1',
            name: '20 BILLED TXN',
            lasttxnseqno: '3',
            id: '90010',
            PLANNO: '10002',
          },
          {
            date: '17-02-2021',
            amount: 4500,
            AUTH_CODE: '',
            STS: 'N',
            LOGICMOD: '1',
            name: '20 BILLED TXN',
            lasttxnseqno: '43',
            id: '90204',
            PLANNO: '10002',
          },
          {
            date: '17-02-2021',
            amount: 4400,
            AUTH_CODE: '',
            STS: 'N',
            LOGICMOD: '1',
            name: '20 BILLED TXN',
            lasttxnseqno: '42',
            id: '90196',
            PLANNO: '10002',
          },
          {
            date: '17-02-2021',
            amount: 4300,
            AUTH_CODE: '',
            STS: 'N',
            LOGICMOD: '1',
            name: '20 BILLED TXN',
            lasttxnseqno: '41',
            id: '90188',
            PLANNO: '10002',
          },
          {
            date: '17-02-2021',
            amount: 4200,
            AUTH_CODE: '',
            STS: 'N',
            LOGICMOD: '1',
            name: '20 BILLED TXN',
            lasttxnseqno: '40',
            id: '90170',
            PLANNO: '10002',
          },
          {
            date: '17-02-2021',
            amount: 4100,
            AUTH_CODE: '',
            STS: 'N',
            LOGICMOD: '1',
            name: '20 BILLED TXN',
            lasttxnseqno: '39',
            id: '90162',
            PLANNO: '10002',
          },
          {
            date: '17-02-2021',
            amount: 4000,
            AUTH_CODE: '',
            STS: 'N',
            LOGICMOD: '1',
            name: '20 BILLED TXN',
            lasttxnseqno: '38',
            id: '90154',
            PLANNO: '10002',
          },
          {
            date: '17-02-2021',
            amount: 3900,
            AUTH_CODE: '',
            STS: 'N',
            LOGICMOD: '1',
            name: '20 BILLED TXN',
            lasttxnseqno: '37',
            id: '90147',
            PLANNO: '10002',
          },
          {
            date: '17-02-2021',
            amount: 3800,
            AUTH_CODE: '',
            STS: 'N',
            LOGICMOD: '1',
            name: '20 BILLED TXN',
            lasttxnseqno: '36',
            id: '90139',
            PLANNO: '10002',
          },
          {
            date: '17-02-2021',
            amount: 3700,
            AUTH_CODE: '',
            STS: 'N',
            LOGICMOD: '1',
            name: '20 BILLED TXN',
            lasttxnseqno: '35',
            id: '90121',
            PLANNO: '10002',
          },
          {
            date: '17-02-2021',
            amount: 3600,
            AUTH_CODE: '',
            STS: 'N',
            LOGICMOD: '1',
            name: '20 BILLED TXN',
            lasttxnseqno: '34',
            id: '90113',
            PLANNO: '10002',
          },
          {
            date: '17-02-2021',
            amount: 3500,
            AUTH_CODE: '',
            STS: 'N',
            LOGICMOD: '1',
            name: '20 BILLED TXN',
            lasttxnseqno: '33',
            id: '90105',
            PLANNO: '10002',
          },
          {
            date: '17-02-2021',
            amount: 3400,
            AUTH_CODE: '',
            STS: 'N',
            LOGICMOD: '1',
            name: '20 BILLED TXN',
            lasttxnseqno: '32',
            id: '90097',
            PLANNO: '10002',
          },
          {
            date: '17-02-2021',
            amount: 3300,
            AUTH_CODE: '',
            STS: 'N',
            LOGICMOD: '1',
            name: '20 BILLED TXN',
            lasttxnseqno: '31',
            id: '90089',
            PLANNO: '10002',
          },
          {
            date: '17-02-2021',
            amount: 3200,
            AUTH_CODE: '',
            STS: 'N',
            LOGICMOD: '1',
            name: '20 BILLED TXN',
            lasttxnseqno: '30',
            id: '90071',
            PLANNO: '10002',
          },
          {
            date: '17-02-2021',
            amount: 3100,
            AUTH_CODE: '',
            STS: 'N',
            LOGICMOD: '1',
            name: '20 BILLED TXN',
            lasttxnseqno: '29',
            id: '90063',
            PLANNO: '10002',
          },
          {
            date: '17-02-2021',
            amount: 3000,
            AUTH_CODE: '',
            STS: 'N',
            LOGICMOD: '1',
            name: '20 BILLED TXN',
            lasttxnseqno: '28',
            id: '90055',
            PLANNO: '10002',
          },
          {
            date: '17-02-2021',
            amount: 2900,
            AUTH_CODE: '',
            STS: 'N',
            LOGICMOD: '1',
            name: '20 BILLED TXN',
            lasttxnseqno: '27',
            id: '90048',
            PLANNO: '10002',
          },
          {
            date: '17-02-2021',
            amount: 2800,
            AUTH_CODE: '',
            STS: 'N',
            LOGICMOD: '1',
            name: '20 BILLED TXN',
            lasttxnseqno: '26',
            id: '90030',
            PLANNO: '10002',
          },
          {
            date: '17-02-2021',
            amount: 2700,
            AUTH_CODE: '',
            STS: 'N',
            LOGICMOD: '1',
            name: '20 BILLED TXN',
            lasttxnseqno: '25',
            id: '90022',
            PLANNO: '10002',
          },
          {
            date: '17-02-2021',
            amount: 2600,
            AUTH_CODE: '',
            STS: 'N',
            LOGICMOD: '1',
            name: '20 BILLED TXN',
            lasttxnseqno: '24',
            id: '90014',
            PLANNO: '10002',
          },
          {
            date: '13-02-2021',
            amount: 4500,
            AUTH_CODE: '',
            STS: 'N',
            LOGICMOD: '1',
            name: '20 UNBILLED TXN',
            lasttxnseqno: '22',
            id: '30209',
            PLANNO: '10002',
          },
          {
            date: '13-02-2021',
            amount: 4400,
            AUTH_CODE: '',
            STS: 'N',
            LOGICMOD: '1',
            name: '20 UNBILLED TXN',
            lasttxnseqno: '21',
            id: '30191',
            PLANNO: '10002',
          },
          {
            date: '13-02-2021',
            amount: 4300,
            AUTH_CODE: '',
            STS: 'N',
            LOGICMOD: '1',
            name: '20 UNBILLED TXN',
            lasttxnseqno: '20',
            id: '30183',
            PLANNO: '10002',
          },
          {
            date: '13-02-2021',
            amount: 4200,
            AUTH_CODE: '',
            STS: 'N',
            LOGICMOD: '1',
            name: '20 UNBILLED TXN',
            lasttxnseqno: '19',
            id: '30175',
            PLANNO: '10002',
          },
          {
            date: '13-02-2021',
            amount: 4100,
            AUTH_CODE: '',
            STS: 'N',
            LOGICMOD: '1',
            name: '20 UNBILLED TXN',
            lasttxnseqno: '18',
            id: '30167',
            PLANNO: '10002',
          },
          {
            date: '13-02-2021',
            amount: 4000,
            AUTH_CODE: '',
            STS: 'N',
            LOGICMOD: '1',
            name: '20 UNBILLED TXN',
            lasttxnseqno: '17',
            id: '30159',
            PLANNO: '10002',
          },
          {
            date: '13-02-2021',
            amount: 3900,
            AUTH_CODE: '',
            STS: 'N',
            LOGICMOD: '1',
            name: '20 UNBILLED TXN',
            lasttxnseqno: '16',
            id: '30142',
            PLANNO: '10002',
          },
          {
            date: '13-02-2021',
            amount: 3800,
            AUTH_CODE: '',
            STS: 'N',
            LOGICMOD: '1',
            name: '20 UNBILLED TXN',
            lasttxnseqno: '15',
            id: '30134',
            PLANNO: '10002',
          },
        ],
        status: {
          errorCode: '0',
          errorMsg: '0',
        },
      },
      responseString: {
        relationNumber: '0001010000000245866',
        primaryCardHolderName: 'TEST FLOTRAPI TEST',
        records: [
          {
            maxEligibleAmt: '00000000000700000',
            procWaiv2: '00',
            procWaiv4: '00',
            procWaiv3: '00',
            period4: '018',
            period3: '012',
            procWaiv5: '0',
            period2: '006',
            maximumProcessingFee5: '>9999999 99',
            plan: '00000',
            maximumProcessingFee4: '00',
            maximumProcessingFee3: '00',
            period5: '024',
            maximumProcessingFee2: '00',
            period: '003',
            minimumProcessingFee2: '00',
            thresholdAmount5: '000000000000',
            maximumProcessingFeeRedef2: '00',
            minimumProcessingFee4: '00',
            thresholdAmount4: '000000000000',
            minimumProcessingFee3: '00',
            thresholdAmount3: '000000000000',
            processingFeeRedef: '799 00',
            maximumProcessingFeeRedef4: '00',
            maximumProcessingFeeRedef3: '00',
            percentageRedef: '> 00',
            maximumProcessingFeeRedef5: '>9999999 99',
            thresholdAmount2: '000000000000',
            interestX4: '01500',
            minimumProcessingFeeRedef: '00',
            interestX5: '01600',
            minimumProcessingFee5: '00',
            interestX2: '01188',
            interestX3: '02488',
            planDescription: '',
            proCode: '009',
            thresholdAmountRedef2: '000000000000',
            prodId: '00009',
            thresholdAmountRedef4: '000000000000',
            thresholdAmountRedef3: '000000000000',
            thresholdAmountRedef5: '000000000000',
            memoLine1: 'MEMOLINE001',
            percentage2: '00',
            percentage3: '> 00',
            feeWaiverFlg: '0',
            percentage4: '00',
            percentage5: '00',
            memoLine4: 'MEMOLINE004',
            memoLine3: 'MEMOLINE003',
            memoLine2: 'MEMOLINE002',
            plan5: '00000',
            plan2: '00000',
            plan3: '00000',
            plan4: '00000',
            interestR2: '1188',
            interestR3: '2488',
            planDescription5: '',
            planDescription3: '',
            interestR4: '1500',
            planDescription4: '',
            interestR5: '1600',
            planDescription2: '',
            processingFee5: '99 00',
            processingFee4: '799 00',
            processingFee3: '799 00',
            processingFeeRedef3: '799 00',
            thresholdAmountRedef: '000000000000',
            processingFeeRedef4: '799 00',
            processingFeeRedef5: '99 00',
            processingFee: '799 00',
            tid: '000000106',
            processingFeeRedef2: '799 00',
            interestO: '0',
            minimumProcessingFee: '00',
            percentage: '> 00',
            logo: '000',
            interestX: '03088',
            prodDesc: 'SMART EMI DIAL AN EMI',
            interestR: '3088',
            eligibleAmtPercent: 'A',
            tid5: '000000192',
            tid3: '000000109',
            tid4: '000000113',
            tid2: '000000101',
            processingFee2: '799 00',
            interest3: '02488',
            interest2: '01188',
            interest5: '01600',
            interest4: '01500',
            maximumProcessingFee: '00',
            percentageRedef3: '> 00',
            encryptedToken: '[B@12a3a380TMDAwMTAxMjM1MDAwMDAwMjEyNDAwMDAwMDAwMDAwMDAwMDA=',
            percentageRedef2: '00',
            logo2: '000',
            interestO5: '0',
            maximumProcessingFeeRedef: '00',
            minimumProcessingFeeRedef5: '00',
            percentageRedef5: '00',
            percentageRedef4: '00',
            minimumProcessingFeeRedef2: '00',
            minimumProcessingFeeRedef3: '00',
            minimumProcessingFeeRedef4: '00',
            logo4: '000',
            logo3: '000',
            procWaivredef5: '0',
            logo5: '000',
            procWaivredef2: '00',
            procWaivredef4: '00',
            procWaivredef3: '00',
            interest: '03088',
            eligible: 'Y',
            eligibleAmt: '00000000000700000',
            interestO3: '0',
            interestO4: '0',
            interestO2: '0',
            thresholdAmount: '000000000000',
            savingAcctNumber: '0000000000000000',
            processingFeeFlag: 'F',
            processingFeeFlag4: 'F',
            processingFeeFlag3: 'F',
            processingFeeFlag5: 'F',
            procWaiv: '00',
            processingFeeFlag2: 'F',
          },
        ],
        custNumber: '0001012350000002124',
        creditLimit: '000300000',
        aanNumber: '0001012350000002124',
      },
      cardHolderName: 'TEST FLOTRAPI TEST FLOTRAPI',
      email: {
        residenceEmail: 'TESTING1234567898765432@MAIL.COM',
        officeEmail: '',
      },
      status: {
        errorCode: '0',
        errorMsg: 'Success',
      },
      Id_token_jwt: '',
    },
  };

  const ccBilledData = resPayload.response.ccBilledTxnResponse.responseString;
  // const ccUnBilledData = resPayload.ccUnBilledTxnResponse.responseString;
  // AUTH_CODE, LOGICMOD, PLANNO, STS, amount, date, id, lasttxnseqno, name
  moveWizardView(domElements.semiWizard, domElements.chooseTransaction);
  cardDisplay(globals, resPayload);
  // didn't works if try to make dynamic.
  const billedTxnPanel = globals.form.aem_semiWizard.aem_chooseTransactions.billedTxnFragment.aem_chooseTransactions.aem_TxnsList;
  // const unBilledTxnPanel = globals.form.aem_semiWizard.aem_chooseTransactions.unbilledTxnFragment.aem_chooseTransactions.aem_TxnsList;
  const billed_txnList = globals.form.aem_semiWizard.aem_chooseTransactions.billedTxnFragment.aem_chooseTransactions.aem_TxnsList;
  // const unbilled_txnList = globals.form.aem_semiWizard.aem_chooseTransactions.billedTxnFragment.aem_chooseTransactions.aem_TxnsList;
  
  if (ccBilledData?.length) {
    globals.functions.dispatchEvent(billedTxnPanel, 'addItem');
    ccBilledData?.forEach((txn, i) => {
      debugger;
      if (i === 0) { /* empty */ } else {
        console.log(`adding instance ${i}`);
        setTimeout(() => {
          globals.functions.setProperty(billedTxnPanel[i - 1]?.aem_TxnAmt, { value: txn?.amount });
          globals.functions.dispatchEvent(billedTxnPanel, 'addItem');
        }, 100 * (2 * i));

        // globals.functions.setProperty(billedTxnPanel[i]?.aem_TxnAmt, { value: txn?.amount });
        // globals.functions.setProperty(billedTxnPanel[i]?.aem_TxnDate, { value: txn?.date });
        // globals.functions.setProperty(billedTxnPanel[i]?.aem_TxnID, { value: txn?.id });
        // globals.functions.setProperty(billedTxnPanel[i]?.billed_TxnName, { value: txn?.name });
      }
    });
  }
  // if (ccUnBilledData?.length) {
  //   ccUnBilledData?.forEach((txn, i) => {
  //     if (i > 1) {
  //       globals.functions.dispatchEvent(unBilledTxnPanel, 'addItem');
  //     }
  //   });
  // }
}
export {
  getOTPV1,
  otpValV1,
  checkELigibilityHandler,
};
