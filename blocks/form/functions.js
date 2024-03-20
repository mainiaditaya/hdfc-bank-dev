/**
 * Get Full Name
 * @name getFullName Concats first name and last name
 * @param {string} firstname in Stringformat
 * @param {string} lastname in Stringformat
 * @return {string}
 */
function getFullName(firstname, lastname) {
  // eslint-disable-next-line no-param-reassign
  firstname = (firstname == null) ? '' : firstname;
  // eslint-disable-next-line no-param-reassign
  lastname = (lastname == null) ? '' : lastname;
  return firstname.concat(' ').concat(lastname);
}
/**
 * On Wizard Init.
 * @name onWizardInit Runs on initialization of wizard
 */
function onWizardInit() {}

/**
 * Calculate the number of days between two dates.
 * @param {*} endDate
 * @param {*} startDate
 * @returns returns the number of days between two dates
 */
function days(endDate, startDate) {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;

  // return zero if dates are valid
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 0;
  }

  const diffInMs = Math.abs(end.getTime() - start.getTime());
  return Math.floor(diffInMs / (1000 * 60 * 60 * 24));
}

/**
 * Called on form init.
 * @name onFormInit Is called on form init
 */
function onFormInit() {}

// eslint-disable-next-line import/prefer-default-export
export {
  getFullName, onWizardInit, days, onFormInit,
};
