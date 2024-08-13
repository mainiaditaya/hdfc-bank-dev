// declare CONSTANTS for (fd) fd only.

const JOURNEY_NAME = 'SMART_EMI_JOURNEY';

const CHANNEL = 'ADOBE_WEB';

const ERROR_MSG = {
  mobileError: 'Enter valid mobile number',
};

const SEMI_ENDPOINTS = {
  otpGen: 'https://applyonlineuat01.hdfcbank.com/content/hdfc_ccforms/api/validatecardotpgen.json',
  otpVal: 'https://applyonlineuat01.hdfcbank.com/content/hdfc_ccforms/api/eligibilitycheck.json',
};

const OTP_TIMER = 30;

const MAX_OTP_RESEND_COUNT = 3;

const CURRENT_FORM_CONTEXT = {};

export {
  JOURNEY_NAME,
  ERROR_MSG,
  OTP_TIMER,
  SEMI_ENDPOINTS,
  MAX_OTP_RESEND_COUNT,
  CURRENT_FORM_CONTEXT,
  CHANNEL,
};
