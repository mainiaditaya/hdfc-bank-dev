// declare COMMON_CONSTANTS for all forms only.
// impoted as CONSTANT key name in all files
import { getSubmitBaseUrl } from '../blocks/form/constant.js';

const BASEURL = getSubmitBaseUrl();
const CHANNEL = 'ADOBE_WEBFORMS';
const ENDPOINTS = {
  aadharCallback: '/content/hdfc_etb_wo_pacc/api/aadharCallback.json',
  aadharInit: '/content/hdfc_haf/api/aadhaarInit.json',
  fetchAuthCode: '/content/hdfc_commonforms/api/fetchauthcode.json',
  emailId: '/content/hdfc_commonforms/api/emailid.json',
  executeInterface: '/content/hdfc_haf/api/executeinterface.json',
  finalDap: '/content/hdfc_haf/api/finalDap.json',
  ipa: '/content/hdfc_haf/api/ipa.json',
  journeyDropOff: '/content/hdfc_commonforms/api/journeydropoff.json',
  journeyDropOffParam: '/content/hdfc_commonforms/api/journeydropoffparam.json',
  journeyDropOffUpdate: '/content/hdfc_commonforms/api/journeydropoffupdate.json',
  resumeJourneyInfo: '/content/hdfc_commonforms/api/returnjourneyinfo.json',
  otpGen: '/content/hdfc_haf/api/otpgenerationccV4.json',
  otpValFetchAssetDemog: '/content/hdfc_haf/api/otpvaldemogV4.json',
  // To be uncommented in release branch
  // panValNameMatch: '/content/hdfc_forms_common_v2/api/panValNameMatch.json',
  panValNameMatch: '/content/hdfc_haf/api/panValidation.json',
  docUpload: '/content/hdfc_etb_wo_pacc/api/documentUpload.json',
  aadhaarCallBack: {
    CORPORATE_CARD_JOURNEY: '/content/hdfc_etb_wo_pacc/api/aadharCallback.json',
    EXISTING_CC_BASED_FDLIEN_JOURNEY: '/content/hdfc_hafcards/api/aadhaarCallback.json',
  },
  aadhaarInit: {
    CORPORATE_CARD_JOURNEY: '/content/hdfc_haf/api/aadhaarInit.json',
    EXISTING_CC_BASED_FDLIEN_JOURNEY: '/content/hdfc_hafcards/api/hdfccardsaadharauthenticationinit.json',
  },
};

const DEAD_PAN_STATUS = ['D', 'ED', 'X', 'F'];

const CURRENT_FORM_CONTEXT = {};

const FORM_RUNTIME = {};

const ID_COM = {
  productCode: 'CORPCC',
  scopeMap: {
    only_casa: {
      no: 'AACC',
      yes: 'ADOBE_PACC',
    },
    casa_asset: {
      no: 'AACC',
      yes: 'ADOBE_PACC',
    },
    casa_cc: 'PADC',
    only_cc: 'OYCC',
    casa_asset_cc: 'PADC',
  },
};

const ENV = 'dev';

const PIN_CODE_LENGTH = 6;

export {
  BASEURL,
  CHANNEL,
  ENDPOINTS,
  DEAD_PAN_STATUS,
  CURRENT_FORM_CONTEXT,
  FORM_RUNTIME,
  ID_COM,
  ENV,
  PIN_CODE_LENGTH,
};
