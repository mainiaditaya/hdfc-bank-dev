/* eslint no-console: ["error", { allow: ["warn", "error"] }] */
import {
  createJourneyId,
  nreNroInvokeJourneyDropOffByParam,
  invokeJourneyDropOffUpdate,
} from './nre-nro-journey-utils.js';
// import {
//   moveWizardView,
// } from '../domutils/domutils.js';
import {
  ageValidator,
  clearString,
  urlPath,
  getTimeStamp,
  maskNumber,
  moveWizardView,
  formUtil,
  santizedFormDataWithContext,
} from '../../common/formutils.js';
import {
  displayLoader,
  hideLoaderGif,
  fetchJsonResponse,
} from '../../common/makeRestAPI.js';
import * as NRE_CONSTANT from './constant.js';
import {
  ENDPOINTS,
  CURRENT_FORM_CONTEXT as currentFormContext,
  FORM_RUNTIME as formRuntime,
} from '../../common/constants.js';
import {
  sendAnalytics,
} from './analytics.js';

setTimeout(async () => {
  if (typeof window !== 'undefined') {
    const { addGaps } = await import('./nre-nro-dom-functions.js');
    addGaps();
  }
}, 1200);

let prevSelectedIndex = -1;
let defaultDropdownIndex = -1;
let resendOtpCount = 0;
const MAX_OTP_RESEND_COUNT = 3;
const OTP_TIMER = 30;
let MAX_COUNT = 3;
let sec = OTP_TIMER;
let dispSec = OTP_TIMER;

const { CHANNEL, JOURNEY_NAME, VISIT_MODE } = NRE_CONSTANT;
// Initialize all NRE/NRO Journey Context Variables.
currentFormContext.journeyName = NRE_CONSTANT.JOURNEY_NAME;
currentFormContext.journeyType = 'NTB';
currentFormContext.errorCode = '';
currentFormContext.errorMessage = '';
currentFormContext.eligibleOffers = '';

formRuntime.getOtpLoader = currentFormContext.getOtpLoader || (typeof window !== 'undefined') ? displayLoader : false;
formRuntime.otpValLoader = currentFormContext.otpValLoader || (typeof window !== 'undefined') ? displayLoader : false;
formRuntime.hideLoader = (typeof window !== 'undefined') ? hideLoaderGif : false;

function customerDataMasking(fieldName, value) {
  if (value != null && value !== undefined && value.length > 0) {
    let splittedValue; let adress; let adressLength; let cityLength; let city; let pin; let pinLength; let country; let contryLength;

    switch
    (fieldName) {
      case
        'PANnmbr':// check legth 10
        if (value.length === 10) {
          const PANvalue = value;
          const maskdPAN = PANvalue.substring(0, 2) + '*'.repeat(2) + PANvalue.substring(4, 5) + '*'.repeat(4) + PANvalue.substring(9, 10);
          return maskdPAN;
        }
        return '';

      case
        'eMail': // checck length after splitting
        if (value.includes('@' && '.')) {
          splittedValue = value.split('@');
          const username = splittedValue[0];
          const userlength = username.length;
          const postSplit = splittedValue[1].split('.');
          const domain = postSplit[0];
          const domainLength = domain.length;
          let part1;
          if (userlength > 1) {
            part1 = username.replace(username.substring(1, (userlength - 1)), '*'.repeat(userlength - 2));
          } else {
            part1 = username;
          }
          const part2 = domain.replace(domain.substring(1, (domainLength)), '*'.repeat(domainLength - 1));
          return `${part1}@${part2}.com`;
        }
        return '';

      case
        'AddressLine': // string length

        adress = value;
        adressLength = adress.length;
        if (adressLength > 1) {
          const maskdAdress = adress.replace(adress.substring(adressLength - Math.round(0.80 * adressLength), adressLength), '*'.repeat(adressLength - (adressLength - Math.round(0.80 * adressLength))));
          return maskdAdress;
        }
        return '';

      case
        'CityState':
        city = value;
        cityLength = city.length;
        if (cityLength > 1) {
          const maskdCity = city.replace(city.substring(1, cityLength - 1), '*'.repeat(cityLength - 2));
          return maskdCity;
        }
        return '';

      case
        'PIN': // check legth
        pin = value;
        pinLength = pin.length;
        if (pinLength === 6) {
          const makdPIN = pin.substring(0, 3) + '*'.repeat(3);
          return makdPIN;
        }
        return '';

      case
        'Country':
        country = value;
        contryLength = country.length;
        if (contryLength > 1) {
          const maskdCountry = country.replace(country.substring(1, contryLength), '*'.repeat(contryLength - 1));
          return maskdCountry;
        }
        return '';

      default: return '';
    }
  } else {
    return '';
  }
}

const validFDPan = (val) => {
  if (val?.length !== 12) return false;
  if (![...val.slice(0, 5)]?.every((c) => /[a-zA-Z]/.test(c))) return false;
  return true;
};
/**
 * Validates the date of birth field to ensure the age is between 18 and 120.
 * @param {Object} globals - The global object containing necessary data for DAP request.
*/

const validateLogin = (globals) => {
  const mobileNo = globals.form.parentLandingPagePanel.landingPanel.loginFragmentNreNro.mobilePanel.registeredMobileNumber.$value;
  const isdCode = (globals.form.parentLandingPagePanel.landingPanel.loginFragmentNreNro.mobilePanel.countryCode.$value)?.replace(/[^a-zA-Z0-9]+/g, '');
  const dobValue = globals.form.parentLandingPagePanel.landingPanel.loginFragmentNreNro.identifierPanel.dateOfBirth.$value;
  const panValue = globals.form.parentLandingPagePanel.landingPanel.loginFragmentNreNro.identifierPanel.pan.$value;
  const panDobSelection = globals.form.parentLandingPagePanel.landingPanel.loginFragmentNreNro.identifierPanel.panDobSelection.$value;
  const radioSelect = (panDobSelection === '0') ? 'DOB' : 'PAN';
  const consentFirst = globals.form.parentLandingPagePanel.landingPanel.consentsFragmentNreNro.checkboxConsent1Label.$value;
  const panErrorText = 'Please enter a valid PAN Number';
  const isdNumberPattern = /^(?!0)([5-9]\d{9})$/;
  const panIsValid = validFDPan(panValue);
  const nonISDNumberPattern = /^(?!0)\d{3,15}$/;
  currentFormContext.isdCode = isdCode;
  globals.functions.setProperty(globals.form.parentLandingPagePanel.getOTPbutton, { enabled: false });

  const panInput = document.querySelector(`[name=${'pan'} ]`);
  const panWrapper = panInput.parentElement;

  switch (radioSelect) {
    case 'DOB':
      if (dobValue && String(new Date(dobValue).getFullYear()).length === 4) {
        const minAge = 18;
        const maxAge = 120;
        const dobErrorText = `Age should be between ${minAge} to ${maxAge}`;
        const ageValid = ageValidator(minAge, maxAge, dobValue);
        if (ageValid && consentFirst) {
          globals.functions.setProperty(globals.form.parentLandingPagePanel.getOTPbutton, { enabled: true });
          globals.functions.markFieldAsInvalid('$form.parentLandingPagePanel.landingPanel.loginFragmentNreNro.dateOfBirth', '', { useQualifiedName: true });
        }
        if (ageValid) {
          globals.functions.markFieldAsInvalid('$form.parentLandingPagePanel.landingPanel.loginFragmentNreNro.dateOfBirth', '', { useQualifiedName: true });
          globals.functions.setProperty(globals.form.parentLandingPagePanel.landingPanel.loginFragmentNreNro.identifierPanel.dateOfBirth, { valid: true });
          globals.functions.setProperty(globals.form.parentLandingPagePanel.landingPanel.loginFragmentNreNro.identifierPanel.dobErrorText, { visible: false });
        }
        if (!ageValid) {
          globals.functions.markFieldAsInvalid('$form.parentLandingPagePanel.landingPanel.loginFragmentNreNro.dateOfBirth', dobErrorText, { useQualifiedName: true });
          globals.functions.setProperty(globals.form.parentLandingPagePanel.landingPanel.loginFragmentNreNro.identifierPanel.dobErrorText, { visible: true });
          globals.functions.setProperty(globals.form.parentLandingPagePanel.getOTPbutton, { enabled: false });
        }
        if (!consentFirst) {
          globals.functions.setProperty(globals.form.parentLandingPagePanel.getOTPbutton, { enabled: false });
        }
      }
      break;
    case 'PAN':
      panWrapper.setAttribute('data-empty', true);
      if (panValue) {
        panWrapper.setAttribute('data-empty', false);
        if (panIsValid && consentFirst && mobileNo) {
          globals.functions.markFieldAsInvalid('$form.parentLandingPagePanel.landingPanel.loginFragmentNreNro.pan', '', { useQualifiedName: true });
          globals.functions.setProperty(globals.form.parentLandingPagePanel.getOTPbutton, { enabled: true });
        }
        if (panIsValid) {
          globals.functions.markFieldAsInvalid('$form.parentLandingPagePanel.landingPanel.loginFragmentNreNro.pan', '', { useQualifiedName: true });
          globals.functions.setProperty(globals.form.parentLandingPagePanel.landingPanel.loginFragmentNreNro.identifierPanel.pan, { valid: true });
          globals.functions.setProperty(globals.form.parentLandingPagePanel.landingPanel.loginFragmentNreNro.identifierPanel.panErrorText, { visible: false });
        }
        if (!panIsValid) {
          globals.functions.markFieldAsInvalid('$form.parentLandingPagePanel.landingPanel.loginFragmentNreNro.pan', panErrorText, { useQualifiedName: true });
          globals.functions.setProperty(globals.form.parentLandingPagePanel.landingPanel.loginFragmentNreNro.identifierPanel.panErrorText, { visible: true });
          globals.functions.setProperty(globals.form.parentLandingPagePanel.getOTPbutton, { enabled: false });
        }
        if (!consentFirst && !mobileNo) {
          globals.functions.setProperty(globals.form.parentLandingPagePanel.getOTPbutton, { enabled: false });
        }
      }
      break;
    default:
      globals.functions.setProperty(globals.form.parentLandingPagePanel.getOTPbutton, { enabled: false });
  }
  if (mobileNo && ((isdCode === '91' && !isdNumberPattern.test(mobileNo))
    || (isdCode !== '91' && !nonISDNumberPattern.test(mobileNo)))) {
    globals.functions.setProperty(globals.form.parentLandingPagePanel.landingPanel.loginFragmentNreNro.mobilePanel.registerMobileNumberError, { visible: true });
    globals.functions.setProperty(globals.form.parentLandingPagePanel.getOTPbutton, { enabled: false });
  } else {
    globals.functions.setProperty(globals.form.parentLandingPagePanel.landingPanel.loginFragmentNreNro.mobilePanel.registerMobileNumberError, { visible: false });
  }
};

const getOtpNRE = (mobileNumber, pan, dob, globals) => {
  /* jidTemporary  temporarily added for FD development it has to be removed completely once runtime create journey id is done with FD */
  const jidTemporary = createJourneyId(VISIT_MODE, JOURNEY_NAME, CHANNEL, globals);
  const [year, month, day] = dob.$value.split('-');
  currentFormContext.action = 'getOTP';
  currentFormContext.journeyID = globals.form.runtime.journeyId.$value || jidTemporary;
  currentFormContext.mobileNumber = mobileNumber.$value;
  currentFormContext.leadIdParam = globals.functions.exportData().queryParams;
  currentFormContext.journeyName = globals.form.runtime.journeyName.$value;
  const jsonObj = {
    requestString: {
      mobileNumber: currentFormContext.isdCode + mobileNumber.$value,
      dateOfBirth: year + month + day,
      panNumber: pan.$value || '',
      journeyID: globals.form.runtime.journeyId.$value ?? jidTemporary,
      journeyName: globals.form.runtime.journeyName.$value || currentFormContext.journeyName,
      identifierValue: pan.$value || clearString(dob.$value),
      identifierName: pan.$value ? 'PAN' : 'DOB',
      getEmail: 'Y',
    },
  };

  const path = urlPath(ENDPOINTS.customerOtpGen);
  formRuntime?.getOtpLoader();
  return fetchJsonResponse(path, jsonObj, 'POST', true);
};

const getCountryCodes = (dropdown) => {
  const finalURL = '/content/hdfc_commonforms/api/mdm.ETB.NRI_ISD_MASTER.COUNTRYNAME-.json';
  fetchJsonResponse(urlPath(finalURL), null, 'GET', true).then((response) => {
    dropdown.addEventListener('change', () => {
      if (prevSelectedIndex !== -1) {
        dropdown.remove(prevSelectedIndex);
      }
      const selectedIndex = dropdown.selectedIndex; // eslint-disable-line prefer-destructuring
      const selectedOption = dropdown.options[selectedIndex];
      const selectedOptionText = selectedOption.text;
      const selectedOptionVal = selectedOption.value;
      const newOption = document.createElement('option');
      newOption.value = selectedOptionVal;
      newOption.text = selectedOptionText;
      dropdown.options[selectedIndex].text = selectedOptionVal;
      dropdown.options[selectedIndex].style.display = 'none';
      dropdown.add(newOption, selectedIndex + 1);
      prevSelectedIndex = selectedIndex;
    });
    dropdown.innerHTML = '';
    response.forEach((countryCode) => {
      if (countryCode.ISDCODE != null && countryCode.DESCRIPTION != null) {
        const val = ` +${String(countryCode.ISDCODE)}`;
        const key = `${countryCode.DESCRIPTION} (${val})`;
        const newOption = document.createElement('option');
        newOption.value = val;
        newOption.textContent = key;
        dropdown.appendChild(newOption);
        if (val === ' +91') {
          defaultDropdownIndex = dropdown.options.length - 1;
        }
      }
    });
    dropdown.selectedIndex = 0;
    if (defaultDropdownIndex !== -1) {
      dropdown.selectedIndex = defaultDropdownIndex;
    }
    const event = new Event('change', {
      bubbles: true, // Allow the event to bubble up
      cancelable: true, // Allow the event to be canceled
    });
    dropdown.dispatchEvent(event);
  }).catch((error) => {
    console.error('Dropdown Promise rejected:', error); // Handle any error (failure case)
  });
};

/**
 * Starts the Nre_Nro OTPtimer for resending OTP.
 * @param {Object} globals - The global object containing necessary data for DAP request.
*/
function otpTimer(globals) {
  if (resendOtpCount < MAX_OTP_RESEND_COUNT) {
    globals.functions.setProperty(globals.form.otppanelwrapper.otpFragment.otpPanel.secondsPanel, { visible: true });
    globals.functions.setProperty(globals.form.otppanelwrapper.otpFragment.otpPanel.otpResend, { visible: false });
  } else {
    globals.functions.setProperty(globals.form.otppanelwrapper.otpFragment.otpPanel.secondsPanel, { visible: false });
  }
  const timer = setInterval(() => {
    sec -= 1;
    dispSec = sec;
    if (sec < 10) {
      dispSec = `0${sec}`;
    }
    globals.functions.setProperty(globals.form.otppanelwrapper.otpFragment.otpPanel.secondsPanel.seconds, { value: dispSec });
    if (sec < 0) {
      clearInterval(timer);
      globals.functions.setProperty(globals.form.otppanelwrapper.otpFragment.otpPanel.secondsPanel, { visible: false });
      if (resendOtpCount < MAX_OTP_RESEND_COUNT) {
        globals.functions.setProperty(globals.form.otppanelwrapper.otpFragment.otpPanel.otpResend, { visible: true });
      }
    }
  }, 1000);
}

function updateOTPHelpText(mobileNo, otpHelpText, email, globals) {
  if (!email) globals.functions.setProperty(otpHelpText, { value: `${otpHelpText} ${maskNumber(mobileNo, 6)}` });
  globals.functions.setProperty(otpHelpText, { value: `${otpHelpText} ${maskNumber(mobileNo, 6)} & email ID ${customerDataMasking('eMail', email)}.` });
}

/**
 * validates the otp
 * @param {object} mobileNumber
 * @param {object} pan
 * @param {object} dob
 * @return {PROMISE}
 */
function otpValidationNRE(mobileNumber, pan, dob, otpNumber, globals) {
  const referenceNumber = `AD${getTimeStamp(new Date())}` ?? '';
  currentFormContext.referenceNumber = referenceNumber;
  currentFormContext.leadProfileId = globals.form.runtime.leadProifileId.$value;
  const jsonObj = {
    requestString: {
      mobileNumber: currentFormContext.isdCode + mobileNumber.$value,
      passwordValue: otpNumber.$value,
      dateOfBirth: clearString(dob.$value) || '',
      panNumber: pan.$value || '',
      journeyID: currentFormContext.journeyID,
      journeyName: globals.form.runtime.journeyName.$value || currentFormContext.journeyName,
      referenceNumber: referenceNumber ?? '',
    },
  };

  const path = urlPath(ENDPOINTS.otpValidationFatca);
  formRuntime?.otpValLoader();
  return fetchJsonResponse(path, jsonObj, 'POST', true);
}

function setupBankUseSection(mainBankUsePanel, globals) {
  /* eslint-disable prefer-destructuring */
  const urlParams = new URLSearchParams(window.location.search);
  const utmParams = {};
  const lgCode = mainBankUsePanel.lgCode;
  const lcCode = mainBankUsePanel.lcCode;
  const toggle = mainBankUsePanel.bankUseToggle;
  const resetAllBtn = mainBankUsePanel.resetAllBtn;
  globals.functions.setProperty(toggle, { checked: true });
  if (urlParams.size > 0) {
    ['lgCode', 'lcCode'].forEach((param) => {
      const value = urlParams.get(param);
      if (value) {
        utmParams[param] = value;
      }
    });

    globals.functions.setProperty(lgCode, { value: utmParams.lgCode });
    globals.functions.setProperty(lcCode, { value: utmParams.lcCode });
  } else {
    globals.functions.setProperty(lgCode, { value: 'NETADDON' });
    globals.functions.setProperty(lcCode, { value: 'NRI INSTASTP' });
  }
  globals.functions.setProperty(resetAllBtn, { enabled: false });
  globals.functions.setProperty(toggle, { enabled: false });
  globals.functions.setProperty(lgCode, { enabled: false });
  globals.functions.setProperty(lcCode, { enabled: false });
}

function showFinancialDetails(financialDetails, response, occupation, globals) {
  const occupationCode = response.customerAMLDetailsDTO[0].codOccupation;
  const selectElement = document.querySelector('[name=occupationDropdown]');
  selectElement.setAttribute('value', occupationCode);
  selectElement.value = occupationCode;
  const occupationText = selectElement.options[selectElement.selectedIndex].text;
  globals.functions.setProperty(financialDetails.occupation, { value: occupationText });
  globals.functions.setProperty(financialDetails.residenceType, { visible: true });
  globals.functions.setProperty(financialDetails.grossAnnualIncome, { visible: true });
  globals.functions.setProperty(financialDetails.currencyName, { visible: true });
  globals.functions.setProperty(financialDetails.sourceOfFunds, { visible: true });
  globals.functions.setProperty(financialDetails.occupation, { visible: true });
  globals.functions.setProperty(financialDetails.occupation, { value: occupationText });

  if (occupationCode === 2) globals.functions.setProperty(financialDetails.selfEmployedProfessional, { visible: true });
  if (occupationCode === 3) {
    globals.functions.setProperty(financialDetails.selfEmployedSince, { visible: true });
    globals.functions.setProperty(financialDetails.natureOfBusiness, { visible: true });
    globals.functions.setProperty(financialDetails.typeOfCompoanyFirm, { visible: true });
  }
  if (occupationCode === 5) {
    globals.functions.setProperty(financialDetails.sourceOfFunds, { visible: false });
    globals.functions.setProperty(financialDetails.typeOfCompoanyFirm, { visible: true });
    globals.functions.setProperty(financialDetails.selfEmployedProfessional, { visible: true });
    globals.functions.setProperty(financialDetails.selfEmployedSince, { visible: true });
    globals.functions.setProperty(financialDetails.natureOfBusiness, { visible: true });
  }
}

function showNomineeDetails(nomineeDetails, response, globals) {
  const listdropdown = response.customerAccountDetailsDTO[1].codRel;
  const relationDropDown = document.querySelector('[name=relationShipDropdown]');
  relationDropDown.setAttribute('value', listdropdown);
  relationDropDown.value = listdropdown;
  const relationText = relationDropDown.options[relationDropDown.selectedIndex].text;
  if (listdropdown !== 0 && listdropdown != null) {
    globals.functions.setProperty(nomineeDetails, { visible: true });
    globals.functions.setProperty(nomineeDetails.nomineePanel.nomineerelation, { value: relationText });
  }
}

function prefillCustomerDetail(response, globals) {
  const {
    personalDetails,
    fatcaDetails,
    financialDetails,
    nomineeDetails,

  } = globals.form.wizardPanel.wizardFragment.wizardNreNro.confirmDetails.confirmDetailsAccordion;

  const changeDataAttrObj = { attrChange: true, value: false, disable: true };

  const setFormValue = (field, value) => {
    const fieldUtil = formUtil(globals, field);
    fieldUtil.setValue(value, changeDataAttrObj);
  };
  currentFormContext.fatca_response = response;

  // globals.functions.setProperty(globals.form.runtime.fatca_response, { value: response });
  setFormValue(personalDetails.emailID, customerDataMasking('eMail', response.refCustEmail));
  setFormValue(personalDetails.fullName, response.customerFullName);
  setFormValue(personalDetails.mobileNumber, `+${currentFormContext.isdCode} ${maskNumber(currentFormContext.mobileNumber, 6)}`);
  setFormValue(personalDetails.pan, customerDataMasking('PANnmbr', response.refCustItNum));
  if (!response.refCustTelex) globals.functions.setProperty(personalDetails.telephoneNumber, { visible: false });
  else setFormValue(personalDetails.telephoneNumber, response.refCustTelex);
  setFormValue(personalDetails.communicationAddress, `${response.txtCustadrAdd1} ${response.txtCustadrAdd2} ${response.txtCustadrAdd3} ${response.namCustadrCity} ${response.namCustadrState} ${response.namCustadrCntry} ${response.txtCustadrZip}`);
  setFormValue(personalDetails.permanentAddress, `${customerDataMasking('AddressLine', response.txtPermadrAdd1)} ${customerDataMasking('AddressLine', response.txtPermadrAdd2)}
   ${customerDataMasking('AddressLine', response.txtPermadrAdd3)} ${customerDataMasking('CityState', response.namPermadrCity)} ${customerDataMasking('CityState', response.namPermadrState)}
   ${customerDataMasking('Country', response.namPermadrCntry)} ${customerDataMasking('PIN', response.txtPermadrZip)}`);
  setFormValue(fatcaDetails.nationality, response.txtCustNATNLTY);
  setFormValue(fatcaDetails.countryTaxResidence, response.customerFATCADtlsDTO[0].codTaxCntry1);
  setFormValue(fatcaDetails.taxIdNumber, response.customerFATCADtlsDTO[0].tinNo1);
  setFormValue(fatcaDetails.addressForTaxPurpose, response.customerFATCADtlsDTO[0].typAddrTax1);
  setFormValue(fatcaDetails.cityOfBirth, response.customerFATCADtlsDTO[0].namCityBirth);
  setFormValue(fatcaDetails.countryOfBirth, response.customerFATCADtlsDTO[0].codCntryBirth);
  setFormValue(fatcaDetails.fathersName, response.customerFATCADtlsDTO[0].namCustFather);
  setFormValue(fatcaDetails.mothersName, response.namMotherMaiden);
  setFormValue(fatcaDetails.spousesName, response.customerFATCADtlsDTO[0].namSpouseCust);
  setFormValue(fatcaDetails.taxIdType, response.customerFATCADtlsDTO[0].typTinNo1);
  setFormValue(financialDetails.sourceOfFunds, response.customerAMLDetailsDTO[0].incomeSource);
  setFormValue(financialDetails.employeerName, response.customerFATCADtlsDTO[0].namCustEmp);
  setFormValue(financialDetails.selfEmployedProfessional, response.customerAMLDetailsDTO[0].txtProfessionDesc);
  setFormValue(financialDetails.selfEmployedSince, response.customerAMLDetailsDTO[0].selfEmpFrom);
  setFormValue(financialDetails.dateOfIncorporation, response.datIncorporated);
  setFormValue(financialDetails.natureOfBusiness, response.customerAMLDetailsDTO[0].natureOfBus);
  setFormValue(financialDetails.typeOfCompoanyFirm, response.customerAMLDetailsDTO[0].typCompany);
  setFormValue(financialDetails.residenceType, response.customerAMLDetailsDTO[0].typResidence);
  setFormValue(financialDetails.currencyName, response.customerAMLDetailsDTO[0].namCcy);
  setFormValue(financialDetails.grossAnnualIncome, response.customerAMLDetailsDTO[0].annualTurnover);
  setFormValue(financialDetails.pepDeclaration, response.customerAMLDetailsDTO[0].amlCod1);
  setFormValue(financialDetails.codeOccupation, response.customerAMLDetailsDTO[0].codOccupation);
  setFormValue(nomineeDetails.nomineeName, response.customerAccountDetailsDTO[0].nomineeName);
  setFormValue(nomineeDetails.dateOfBirth, response.customerAccountDetailsDTO[0].nomineeDOB);
}

function prefillAccountDetail(response, globals, i, responseLength) {
  const {
    customerName,
    customerID,
    singleAccount,
    multipleAccounts,
    custIDWithoutMasking,
  } = globals.form.wizardPanel.wizardFragment.wizardNreNro.selectAccount;

  const changeDataAttrObj = { attrChange: true, value: false, disable: true };

  const setFormValue = (field, value) => {
    const fieldUtil = formUtil(globals, field);
    fieldUtil.setValue(value, changeDataAttrObj);
  };
  setFormValue(customerName, response.customerFullName);
  setFormValue(customerID, maskNumber(response.customerId, 4));
  setFormValue(custIDWithoutMasking, response.customerId);
  setFormValue(singleAccount.customerID, maskNumber(response.customerId, 4));
  if (responseLength > 1) {
    setFormValue(multipleAccounts.multipleAccountRepeatable[i].accountNumber, maskNumber(response.customerAccountDetailsDTO[i].accountNumber, 10));
    setFormValue(multipleAccounts.multipleAccountRepeatable[i].multiSubPanel.accountType, response.customerAccountDetailsDTO[i].productName);
    setFormValue(multipleAccounts.multipleAccountRepeatable[i].multiIFSCBranchPanel.branch, response.customerAccountDetailsDTO[i].branchName);
    setFormValue(multipleAccounts.multipleAccountRepeatable[i].multiIFSCBranchPanel.ifscCode, response.customerAccountDetailsDTO[i].ifscCode);
  } else {
    setFormValue(singleAccount.accountNumber, maskNumber(response.customerAccountDetailsDTO[0].accountNumber, 10));
    setFormValue(singleAccount.accountType, response.customerAccountDetailsDTO[0].productName);
    setFormValue(singleAccount.branch, response.customerAccountDetailsDTO[0].branchName);
    setFormValue(singleAccount.ifsc, response.customerAccountDetailsDTO[0].ifscCode);
  }
}

function multiCustomerId(response, singleAccountCust, multipleAccountsPanel, globals) {
  const accountDetailsList = response.customerAccountDetailsDTO;
  const responseLength = accountDetailsList.length;
  // globals.functions.setProperty(globals.form.wizardPanel.wizardFragment.wizardNreNro.selectAccount.multipleAccounts.multipleAccountRepeatable[0]?.AccountNumber, { value: accountDetailsList[0].accountNumber });
  if (responseLength > 1) {
    globals.functions.setProperty(singleAccountCust, { visible: false });
    globals.functions.setProperty(multipleAccountsPanel, { visible: true });
    globals.functions.setProperty(globals.form.wizardPanel.continue, { visible: false });
    globals.functions.setProperty(globals.form.wizardPanel.MultiAccoCountinue, { visible: true });
    accountDetailsList.forEach((accountDetail, i) => {
      if (i < accountDetailsList.length - 1) {
        globals.functions.dispatchEvent(globals.form.wizardPanel.wizardFragment.wizardNreNro.selectAccount.multipleAccounts.multipleAccountRepeatable, 'addItem');
      }
      setTimeout(() => {
        prefillAccountDetail(response, globals, i, responseLength);
        const radioButtons = Array.from(document.querySelectorAll('.field-multiplecustidaccount input'));
        radioButtons.forEach((radioButton) => {
          radioButton.setAttribute('name', 'cust-id-radio');
        });
      }, 1000);
    });
  } else {
    globals.functions.setProperty(globals.form.wizardPanel.wizardFragment.wizardNreNro.selectAccount.nro_account_type_pannel, { visible: true });
    globals.functions.setProperty(globals.form.wizardPanel.MultiAccoCountinue, { visible: false });
    prefillAccountDetail(response, globals, '', responseLength);
  }
  prefillCustomerDetail(response, globals);
}

/**
 * @name resendOTP
 * @param {Object} globals - The global object containing necessary data for DAP request.
 * @return {PROMISE}
 */
const resendOTP = async (globals) => {
  dispSec = OTP_TIMER;
  const mobileNo = globals.form.parentLandingPagePanel.landingPanel.loginFragmentNreNro.mobilePanel.registeredMobileNumber;
  const panValue = globals.form.parentLandingPagePanel.landingPanel.loginFragmentNreNro.identifierPanel.pan;
  const dobValue = globals.form.parentLandingPagePanel.landingPanel.loginFragmentNreNro.identifierPanel.dateOfBirth;
  globals.functions.setProperty(globals.form.otppanelwrapper.otpFragment.otpPanel.otpResend, { visible: false });
  globals.functions.setProperty(globals.form.otppanelwrapper.otpFragment.otpPanel.secondsPanel, { visible: true });
  globals.functions.setProperty(globals.form.otppanelwrapper.otpFragment.otpPanel.secondsPanel.seconds, { value: dispSec });
  if (resendOtpCount < MAX_OTP_RESEND_COUNT) {
    resendOtpCount += 1;

    const otpResult = await getOtpNRE(mobileNo, panValue, dobValue, globals);
    globals.functions.setProperty(globals.form.otppanelwrapper.otpFragment.otpPanel.secondsPanel.seconds, { value: dispSec });
    if (otpResult && otpResult.customerIdentificationResponse.existingCustomer === 'Y') {
      sec = OTP_TIMER;
      otpTimer(globals);
    } else {
      globals.functions.setProperty(globals.form.otppanelwrapper.otpFragment.otpPanel.errorMessage, { visible: true, message: otpResult.message });
      globals.functions.setProperty(globals.form.otppanelwrapper.otpFragment.otpPanel.otpResend, { visible: true });
    }

    if (resendOtpCount === MAX_OTP_RESEND_COUNT) {
      globals.functions.setProperty(globals.form.otppanelwrapper.otpFragment.otpPanel.secondsPanel, { visible: false });
      globals.functions.setProperty(globals.form.otppanelwrapper.otpFragment.otpPanel.otpResend, { visible: false });
      globals.functions.setProperty(globals.form.otppanelwrapper.otpFragment.otpPanel.maxAttemptMessage, { visible: true });
    }
    return otpResult;
  }

  return null; // Return null if max attempts reached
};

/**
   * Creates an IdCom request object based on the provided global data.
   * @param {Object} globals - The global object containing necessary data for IdCom request.
   * @returns {Object} - The IdCom request object.
   */
const createIdComRequestObj = (globals) => {
  const formData = santizedFormDataWithContext(globals);
  const idComObj = {
    requestString: {
      CustID: globals.form.wizardPanel.wizardFragment.wizardNreNro.selectAccount.custIDWithoutMasking.$value,
      ProductCode: 'ADETBACO',
      userAgent: window.navigator.userAgent,
      journeyID: formData.journeyId,
      journeyName: formData.journeyName,
      scope: 'ADOBE_ACNRI',
    },
  };
  return idComObj;
};

/**
   * Fetches an authentication code from the API.
   *
   * This function creates an idcomm request object, constructs the API endpoint URL,
   * and then sends a POST request to the endpoint to fetch the authentication code.
   * @name fetchAuthCode
   * @params {object} globals
   * @returns {Promise<Object>} A promise that resolves to the JSON response from the API.
   */
const fetchAuthCode = (globals) => {
  currentFormContext.VISIT_TYPE = 'IDCOMM';
  const idComRequest = createIdComRequestObj(globals);
  const apiEndPoint = urlPath(ENDPOINTS.fetchAuthCode);
  return fetchJsonResponse(apiEndPoint, idComRequest, 'POST');
};

function customFocus(numRetries, globals) {
  MAX_COUNT -= 1;
  if (MAX_COUNT < MAX_OTP_RESEND_COUNT) {
    globals.functions.setProperty(numRetries, { value: `${MAX_COUNT}/${MAX_OTP_RESEND_COUNT}` });
  }
}

async function idComRedirection(globals) {
  const {
    mobileNumber,
    leadProfileId,
    journeyID,
  } = currentFormContext;
  const resp = await fetchAuthCode(globals);
  if (resp.status.errorMessage === 'Success') {
    await invokeJourneyDropOffUpdate('IDCOM_REDIRECTION_INITIATED', mobileNumber, leadProfileId, journeyID, globals);
    window.location.href = resp.redirectUrl;
  }
}

/**
 * @name finalResult - constant-variables store
 */
const finalResult = {
  journeyParamState: null,
  journeyParamStateInfo: null,
};

// post-redirect-aadhar-or-idcom
const searchParam = new URLSearchParams(window.location.search);
const authModeParam = searchParam.get('authmode');
const journeyId = searchParam.get('journeyId');
const idComRedirect = authModeParam && ((authModeParam === 'DebitCard') || (authModeParam === 'NetBanking')); // debit card or net banking flow

/**
 * @name nreNroFetchRes - async action call maker until it reaches the final response.
 * @returns {void}
 */
// eslint-disable-next-line no-unused-vars
const nreNroFetchRes = async (globals) => {
  try {
    // globals.functions.setProperty(globals.form.runtime.journeyId, { value: journeyId });
    const data = await nreNroInvokeJourneyDropOffByParam('', '', journeyId);
    const journeyDropOffParamLast = data.formData.journeyStateInfo[data.formData.journeyStateInfo.length - 1];
    finalResult.journeyParamState = journeyDropOffParamLast.state;
    finalResult.journeyParamStateInfo = journeyDropOffParamLast.stateInfo;
    // if(journeyDropOffParamLast.state == 'CUSTOMER_ONBOARDING_COMPLETE'){
    // console.log("Show Error Here");
    // }
    // eslint-disable-next-line no-unused-vars
    const checkFinalSuccess = (journeyDropOffParamLast.state === 'IDCOM_REDIRECTION_INITIATED');
    // if (checkFinalSuccess) {
    // console.log("checkFinalSuccess : " , checkFinalSuccess);
    // }
    const err = 'Bad response';
    throw err;
  } catch (error) {
    // eslint-disable-next-line no-unused-vars
    const errorCase = (finalResult.journeyParamState === 'CUSTOMER_FINAL_FAILURE');
    // eslint-disable-next-line no-unused-vars
    const stateInfoData = finalResult.journeyParamStateInfo;
    // if (errorCase) {
    //   console.log("Error Case : " , errorCase);
    // }
  }
};

/**
 * Redirects the user to different panels based on conditions.
 * If `idCom` is true, initiates a journey drop-off process and handles the response.
 * @param {boolean} idCom - Indicates whether ID com redirection is triggered.
 * @returns {void}
 */
const nreNroPageRedirected = (idCom, globals) => {
  if (idCom) {
    setTimeout(() => {
      displayLoader();
      nreNroFetchRes(globals);
    }, 2000);
  }
};

const addPageNameClassInBody = (pageName) => {
  if (pageName === 'Get_OTP_Page' || pageName === 'Submit_OTP') {
    document.body.classList.add('errorPageBody');
  }
  if (pageName === 'Select_Account') {
    document.body.classList.add('wizardPanelBody');
  }
  if (pageName === 'ThankYou_Page') {
    document.body.classList.add('nreThankYouPage');
  }
};

const switchWizard = (globals) => {
  const {
    mobileNumber,
    leadProfileId,
    journeyID,
  } = currentFormContext;

  invokeJourneyDropOffUpdate('CUSTOMER_ACCOUNT_VARIANT_SELECTED', mobileNumber, leadProfileId, journeyID, globals);
  moveWizardView('wizardNreNro', 'confirmDetails');
  currentFormContext.action = 'Confirm Details';
  Promise.resolve(sendAnalytics('page load-Confirm Details', { }, 'ON_CONFIRM_DETAILS_PAGE_LOAD', globals));
};

const onPageLoadAnalytics = async (globals) => {
  await Promise.resolve(sendAnalytics('page load-All Pages', { }, 'ON_PAGE_LOAD', globals));
};

setTimeout((globals) => {
  onPageLoadAnalytics(globals);
}, 5000);

// eslint-disable-next-line func-names
setTimeout(async (globals) => {
  await nreNroPageRedirected(idComRedirect, globals);
  if (typeof window !== 'undefined') { /* check document-undefined */
    getCountryCodes(document.querySelector('.field-countrycode select'));
  }
}, 2000);

export {
  validateLogin,
  getOtpNRE,
  otpTimer,
  otpValidationNRE,
  updateOTPHelpText,
  getCountryCodes,
  resendOTP,
  customFocus,
  validFDPan,
  switchWizard,
  setupBankUseSection,
  idComRedirection,
  addPageNameClassInBody,
  showFinancialDetails,
  showNomineeDetails,
  multiCustomerId,
};
