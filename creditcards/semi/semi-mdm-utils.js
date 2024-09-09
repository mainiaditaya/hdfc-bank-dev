import * as SEMI_CONSTANT from './constant.js';
import { getJsonResponse } from '../../common/makeRestAPI.js';
import { getUrlParamCaseInsensitive, setSelectOptions } from './semi-utils.js';
import { clearString, formUtil } from '../../common/formutils.js';

const { SEMI_ENDPOINTS: semiEndpoints } = SEMI_CONSTANT;

/* Utp-Params */
const UTM_PARAMS = {
  channel: null, // CHANNEL
  lgcode: null, // LGCODE
  smcode: null, // SMCODE
  lc2: null, // LC1
  lc1: null, // LC2
  dsacode: null, // DSACODE
  branchcode: null, // BRANCHCODE
};

/**
 * extract all the asst panal form object by passing globals
 * @param {object} globals - global form object;
 * @returns {object} - All pannel object present inside employee asst pannel
 */

const extractEmpAsstPannels = async (globals) => {
  const employeeAsstPanel = globals.form.aem_semiWizard.aem_selectTenure.aem_employeeAssistancePanel;
  const {
    aem_channel: channel,
    aem_bdrLc1Code: bdrLc1Code,
    aem_branchCity: branchCity,
    aem_branchCode: branchCode,
    aem_branchName: branchName,
    aem_branchTseLgCode: branchTseLgCode,
    aem_dsaCode: dsaCode,
    aem_dsaName: dsaName,
    aem_lc1Code: lc1Code,
    aem_lc2Code: lc2Code,
    aem_lgTseCode: lgTseCode,
    aem_smCode: smCode,
  } = employeeAsstPanel;
  return {
    channel, bdrLc1Code, branchCity, branchCode, branchName, branchTseLgCode, dsaCode, dsaName, lc1Code, lc2Code, lgTseCode, smCode,
  };
};

/**
 * Sets the value of a form field using the provided globals and field.
 * @param {Object} globals - The global state object.
 * @param {string} field - The name of the field to set.
 * @param {string|null} value - The value to set for the field.
 */
const setFieldsValue = (globals, field, value) => {
  const fieldUtil = formUtil(globals, field);
  const changeDataAttrObj = { attrChange: true, value: false, disable: true };
  const valueInUC = (String(value))?.toUpperCase();
  fieldUtil.setValue(valueInUC, changeDataAttrObj);
};

/**
 * Pre-fills form fields based on UTM parameters if they exist.
 * The function maps UTM parameters to their respective fields and sets their values.
 * @async
 * @param {Object} globals - The global state object used for fetching fields and values.
 */
const preFillFromUtm = async (globals) => {
  const {
    branchCode, dsaCode, lc1Code, lc2Code, smCode, lgTseCode,
  } = await extractEmpAsstPannels(globals);
  // Mapping UTM params to field names
  const fieldMapping = {
    dsacode: dsaCode,
    lc1: lc1Code,
    lc2: lc2Code,
    branchcode: branchCode,
    smcode: smCode,
    lgcode: lgTseCode,
  };
    // Iterate over the UTM_PARAMS object
  Object.entries(UTM_PARAMS).forEach(([key, value]) => {
    if (value && fieldMapping[key]) {
      setFieldsValue(globals, fieldMapping[key], value);
    }
  });
};

/**
   * initiate master channel api on toggle switch
   * @param {object} globals - global form object
   */
const assistedToggleHandler = async (globals) => {
  try {
    const response = await getJsonResponse(semiEndpoints.masterChanel, null, 'GET');
    const { channel, ...asstPannels } = await extractEmpAsstPannels(globals);
    const asstPannelArray = Object.entries(asstPannels).map(([, proxyFiels]) => proxyFiels);
    const channelDropDown = channel;
    const DEF_OPTION = [{ label: 'Website Download', value: 'Website Download' }];
    const responseOption = response?.map((item) => ({ label: item?.CHANNELS, value: item?.CHANNELS }));
    const channelOptions = responseOption?.length ? DEF_OPTION.concat(responseOption) : DEF_OPTION;
    const chanelEnumNames = channelOptions?.map((item) => item?.label);
    setSelectOptions(channelOptions, channelDropDown?.$name);
    if (UTM_PARAMS.channel) {
      const findParamChanelValue = channelOptions?.find((el) => clearString(el.value)?.toLocaleLowerCase() === clearString(UTM_PARAMS.channel)?.toLocaleLowerCase());
      globals.functions.setProperty(channelDropDown, { enum: channelOptions, enumNames: chanelEnumNames, value: findParamChanelValue.value });
      await preFillFromUtm(globals);
    } else {
      globals.functions.setProperty(channelDropDown, { enum: channelOptions, enumNames: chanelEnumNames, value: DEF_OPTION[0].value });
      asstPannelArray?.forEach((pannel) => globals.functions.setProperty(pannel, { visible: false }));
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
  }
};

/**
   * change handler in channel dropdown
   * @param {object} globals - global form object
   */
const channelDDHandler = async (globals) => {
  const { channel, ...asstPannels } = await extractEmpAsstPannels(globals);
  const asstPannelArray = Object.entries(asstPannels).map(([, proxyFiels]) => proxyFiels);
  asstPannelArray?.forEach((item) => globals.functions.setProperty(item, { visible: false }));
  const {
    bdrLc1Code, branchCity, branchCode, branchName, branchTseLgCode, dsaCode, dsaName, lc1Code, lc2Code, lgTseCode, smCode,
  } = asstPannels;
  const pannelSetting = {
    websiteDownload: asstPannelArray,
    branch: [branchCode, branchName, branchCity, smCode, bdrLc1Code, lc2Code, branchTseLgCode],
    dsa: [dsaCode, dsaName, smCode, bdrLc1Code, lc2Code, lgTseCode],
    defaultCase: [smCode, lc1Code, lc2Code, lgTseCode],
  };
  const CHANNEL_VALUE = clearString(channel.$value)?.toLowerCase();
  switch (CHANNEL_VALUE) {
    case 'websitedownload':
      asstPannelArray?.forEach((item) => globals.functions.setProperty(item, { visible: false }));
      break;
    case 'branch':
      pannelSetting.branch?.forEach((item) => globals.functions.setProperty(item, { visible: true }));
      break;
    case 'dsa':
      pannelSetting.dsa?.forEach((item) => globals.functions.setProperty(item, { visible: true }));
      break;
    default:
      pannelSetting.defaultCase?.forEach((item) => globals.functions.setProperty(item, { visible: true }));
  }
};

/**
   * branchcode handler
   * @param {object} globals - globals form object
   */
const branchHandler = async (globals) => {
  const { branchName, branchCity, branchCode } = await extractEmpAsstPannels(globals);
  const branchNameUtil = formUtil(globals, branchName);
  const branchCityUtil = formUtil(globals, branchCity);
  // eslint-disable-next-line no-unused-vars
  const INVALID_MSG = 'Please enter valid Branch Code';
  globals.functions.markFieldAsInvalid(branchCode.$qualifiedName, '', { useQualifiedName: true });
  try {
    const branchCodeUrl = `${semiEndpoints.branchMaster}-${branchCode.$value}.json`;
    const response = await getJsonResponse(branchCodeUrl, null, 'GET');
    const data = response?.[0];
    if (data?.errorCode === '500') {
      throw new Error(data?.errorMessage);
    } else {
      const cityName = data?.CITY_NAME;
      const branchnameVal = data?.BRANCH_NAME;
      const changeDataAttrObj = { attrChange: true, value: false, disable: true };
      branchNameUtil.setValue(branchnameVal, changeDataAttrObj);
      branchCityUtil.setValue(cityName, changeDataAttrObj);
    }
  } catch (error) {
    // globals.functions.markFieldAsInvalid(branchCode.$qualifiedName, INVALID_MSG, { useQualifiedName: true });
    branchNameUtil.resetField();
    branchCityUtil.resetField();
  }
};

/**
   * dsa code change handler
   * @param {globals} globals - globals - form object
   */
const dsaHandler = async (globals) => {
  //  'XKSD' //BSDG003
  const { dsaCode, dsaName } = await extractEmpAsstPannels(globals);
  // eslint-disable-next-line no-unused-vars
  const INVALID_MSG = 'Please enter valid DSA Code';
  const dsaNameUtil = formUtil(globals, dsaName);
  // globals.functions.markFieldAsInvalid(dsaCode.$qualifiedName, '', { useQualifiedName: true });
  try {
    const dsaCodeUrl = `${semiEndpoints.dsaCode}-${dsaCode.$value?.toLowerCase()}.json`;
    const response = await getJsonResponse(dsaCodeUrl, null, 'GET');
    const data = response?.[0];
    if (data?.errorCode === '500') {
      throw new Error(data?.errorMessage);
    } else {
      // globals.functions.setProperty(dsaCode, { valid: true });
      // globals.functions.markFieldAsInvalid(dsaCode.$qualifiedName, '', { useQualifiedName: true });
      const dsaNameVal = data?.DSANAME;
      const changeDataAttrObj = { attrChange: true, value: false, disable: true };
      dsaNameUtil.setValue(dsaNameVal, changeDataAttrObj);
    }
  } catch (error) {
    // globals.functions.markFieldAsInvalid(dsaCode.$qualifiedName, INVALID_MSG, { useQualifiedName: true });
    dsaNameUtil.resetField();
    // eslint-disable-next-line no-console
    console.log(error);
  }
};

/**
 * To handle utm parameter
 */
const handleMdmUtmParam = async (globals) => {
  if (window !== undefined) {
    Object.entries(UTM_PARAMS).forEach(([key]) => {
      UTM_PARAMS[key] = getUrlParamCaseInsensitive(key);
    });
    const paramFound = Object.entries(UTM_PARAMS).some(([, val]) => val);
    if (paramFound) {
      globals.functions.setProperty(globals.form.aem_semiWizard.aem_selectTenure.aem_bankAssistedToggle, { value: 'Yes' });
    }
  }
};

export {
  assistedToggleHandler,
  channelDDHandler,
  branchHandler,
  dsaHandler,
  handleMdmUtmParam,
};
