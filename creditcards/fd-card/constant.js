// declare CONSTANTS for (fd) fd only.

const JOURNEY_NAME = 'FDLIEN_CARD_JOURNEY';

const AGE_LIMIT = {
  min: 18,
  max: 70,
};

const REGEX_PAN = /^[a-zA-Z]{3}[Pp][a-zA-Z][0-9]{4}[a-zA-Z]{1}/g;
// const REGEX_PAN = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/g;

const ERROR_MSG = {
  panLabel: 'PAN',
  dobLabel: 'DOB',
  panError: 'Please enter a valid PAN Number',
  mobileError: 'Enter valid mobile number',
  ageLimit: `Age should be between ${AGE_LIMIT.min} to ${AGE_LIMIT.max}`,
};

export {
  JOURNEY_NAME,
  ERROR_MSG,
  AGE_LIMIT,
  REGEX_PAN,
};
