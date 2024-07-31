// declare CONSTANTS for (fd) fd only.

const JOURNEY_NAME = 'CORPORATE_CARD_JOURNEY';
const MIN_AGE = 18;
const MAX_AGE = 70;
const ERROR_MSG = {
  panLabel: 'PAN',
  dobLabel: 'DOB',
  panError: 'Please enter a valid PAN Number',
  ageLimit: `Age should be between ${MIN_AGE} to ${MAX_AGE}`,
};

export {
  JOURNEY_NAME,
  ERROR_MSG,
  MIN_AGE,
  MAX_AGE,
};
