/* eslint-disable no-underscore-dangle */
/* eslint-disable no-useless-escape */
import { CURRENT_FORM_CONTEXT, FORM_RUNTIME as formRuntime } from '../../common/constants.js';
import { composeNameOption, formUtil, urlPath } from '../../common/formutils.js';
import { getJsonResponse, displayLoader } from '../../common/makeRestAPI.js';
import { addDisableClass, setSelectOptions } from '../domutils/domutils.js';
import { FD_ENDPOINTS, NAME_ON_CARD_LENGTH } from './constant.js';

let CUSTOMER_DATA_BINDING_CHECK = true;

const initializeNameOnCardDdOptions = (globals, personalDetails, customerInfo) => {
  const elementNameSelect = 'nameOnCardDD';
  // const { customerFirstName, customerMiddleName, customerLastName } = customerInfo;
  const customerFirstName = customerInfo.customerFirstName ? customerInfo.customerFirstName : 'FirstName';
  const customerMiddleName = customerInfo.customerMiddleName ? customerInfo.customerMiddleName : 'MiddleName';
  const customerLastName = customerInfo.customerLastName ? customerInfo.customerLastName : 'LastName';
  const options = composeNameOption(
    customerFirstName.toUpperCase(),
    customerMiddleName.toUpperCase(),
    customerLastName.toUpperCase(),
    'fd',
    NAME_ON_CARD_LENGTH,
  );
  const initialValue = options[0]?.value;
  setSelectOptions(options, elementNameSelect);
  globals.functions.setProperty(personalDetails.nameOnCardDD, { enum: options, value: initialValue });
};

/**
 * @name bindEmployeeAssitanceField
 * @returns {Promise<Object>} - A promise that resolves with the JSON response from the provided URL.
 */
const bindEmployeeAssitanceField = async (globals) => {
  const params = new URLSearchParams(window.location.search);
  const { employeeAssistancePanel } = globals.form.fdBasedCreditCardWizard.basicDetails.reviewDetailsView.employeeAssistance;
  const elementNameSelect = 'channel';
  let defaultChannel = params.get('channel');
  const url = FD_ENDPOINTS.masterchannel;
  const method = 'GET';
  const errorMethod = async (errStack) => {
    console.log(errStack);
  };
  const successMethod = async (data) => {
    const dropDownSelectField = employeeAssistancePanel.channel;
    const options = [{ label: 'Website Download', value: 'Website Download' }];
    let noMatch = true;
    data.forEach((item) => {
      options.push({ label: item.CHANNELS, value: item.CHANNELS });
      if (defaultChannel?.toLowerCase() === item.CHANNELS.toLowerCase()) {
        defaultChannel = item.CHANNELS;
        noMatch = false;
      }
    });
    if (noMatch) {
      defaultChannel = options[0].value;
    }
    setSelectOptions(options, elementNameSelect);
    globals.functions.setProperty(dropDownSelectField, { enum: options, value: defaultChannel });
  };
  try {
    const response = await getJsonResponse(url, null, method);
    const [{ errorCode, errorMessage }] = response;
    if (response) {
      successMethod(response);
    } else if (errorCode) {
      const errStack = { errorCode, errorMessage };
      throw errStack;
    }
  } catch (error) {
    errorMethod(error);
  }
};
/**
 * Binds customer details from the global context to the current form.
 * @name bindCustomerDetails
 * @param {Object} globals - The global context object containing various information.
 */
const bindCustomerDetails = (globals) => {
  if (!CUSTOMER_DATA_BINDING_CHECK) return;
  CUSTOMER_DATA_BINDING_CHECK = false;
  formRuntime.validatePanLoader = (typeof window !== 'undefined') ? displayLoader : false;
  bindEmployeeAssitanceField(globals);
  const { customerInfo } = CURRENT_FORM_CONTEXT;
  const changeDataAttrObj = { attrChange: true, value: false, disable: true };
  const genderMap = { Male: '0', Female: '1', Others: '3' };
  const { reviewDetailsView } = globals.form.fdBasedCreditCardWizard.basicDetails;
  const { personalDetails, addressDetails } = reviewDetailsView;

  const setFormValue = (field, value) => {
    const fieldUtil = formUtil(globals, field);
    fieldUtil.setValue(value, changeDataAttrObj);
  };
  customerInfo.customerFullName = 'FirstName MiddleName LastName';
  setFormValue(personalDetails.fullName, customerInfo.customerFullName);
  setFormValue(personalDetails.gender, genderMap[customerInfo.gender]);
  setFormValue(personalDetails.dateOfBirthPersonalDetails, customerInfo.dob);
  if (customerInfo.pan) {
    const formattedPan = customerInfo.pan.replace(/([A-Za-z])(\d)|(\d)([A-Za-z])/g, '$1$3 $2$4');
    setFormValue(personalDetails.panNumberPersonalDetails, formattedPan);
  }
  setFormValue(addressDetails.prefilledMailingAdddress, customerInfo.address);
  const emailIDUtil = formUtil(globals, personalDetails.emailID);
  emailIDUtil.setValue(customerInfo.emailId, { attrChange: true, value: false });
  // setFormValue(personalDetails.fullName, '');
  // setFormValue(personalDetails.panNumberPersonalDetails, '');
  // setFormValue(personalDetails.emailID, '');
  // setFormValue(addressDetails.prefilledMailingAdddress, '');
  if (customerInfo.address.length === 0) {
    globals.functions.setProperty(addressDetails.prefilledMailingAdddress, { visible: false });
    globals.functions.setProperty(addressDetails.mailingAddressToggle, { value: 'off', enabled: false });
  }
  if (customerInfo.customerFullName.length < NAME_ON_CARD_LENGTH) {
    setFormValue(personalDetails.nameOnCard, customerInfo.customerFullName?.toUpperCase());
  } else {
    globals.functions.setProperty(personalDetails.nameOnCard, { visible: false });
    globals.functions.setProperty(personalDetails.nameOnCardDD, { visible: true });
    initializeNameOnCardDdOptions(globals, personalDetails, customerInfo);
  }

  const personaldetails = document.querySelector('.field-personaldetails');
  setTimeout(() => {
    addDisableClass(personaldetails, ['nameOnCardDD', 'emailID']);
  }, 10);
};

/**
 *
 * @name validateEmailID
 * @param {Object} globals - The global context object containing various information.
 */
const validateEmailID = async (email, globals) => {
  const url = urlPath(FD_ENDPOINTS.emailId);
  const invalidMsg = 'Please enter valid email id...';
  const payload = {
    email,
  };
  const method = 'POST';
  try {
    const emailValid = await getJsonResponse(url, payload, method);
    if (emailValid === true) {
      console.log(email, globals, invalidMsg);
    } else {
      console.log(email);
    }
  } catch (error) {
    console.error(error, 'error in emailValid');
  }
};

const setVisibility = (panel, properties, visibility, globals) => {
  properties.forEach((property) => {
    globals.functions.setProperty(panel[property], { visible: visibility });
  });
};

/**
 *
 * @name channelChangeHandler
 * @param {Object} globals - The global context object containing various information.
 */
const channelChangeHandler = (globals) => {
  const { employeeAssistancePanel } = globals.form.fdBasedCreditCardWizard.basicDetails.reviewDetailsView.employeeAssistance;
  const channelValue = employeeAssistancePanel.channel._data.$_value;

  const visibilitySettings = {
    'website download': ['branchCity', 'branchCode', 'branchName', 'cardsBdrLc1', 'tseLgCode', 'dsaCode', 'dsaName', 'lc1Code', 'lc2Code', 'lgCode', 'smCode'],
    branch: ['dsaCode', 'dsaName', 'lc1Code', 'lgCode'],
    dsa: ['branchCity', 'branchCode', 'branchName', 'tseLgCode', 'cardsBdrLc1'],
    default: ['branchCity', 'branchCode', 'branchName', 'cardsBdrLc1', 'tseLgCode', 'dsaCode', 'dsaName'],
  };

  const propertiesToHide = visibilitySettings[channelValue.toLowerCase()] || visibilitySettings.default;
  setVisibility(employeeAssistancePanel, propertiesToHide, false, globals);
};

export {
  bindCustomerDetails,
  validateEmailID,
  channelChangeHandler,
};
