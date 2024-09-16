/* eslint no-bitwise: ["error", { "allow": ["^", ">>", "&"] }] */

import {
  generateUUID,
} from './formutils.js';

/**
   * @name createJourneyId
   * @param {string} visitMode - The visit mode (e.g., "online", "offline").
   * @param {string} journeyAbbreviation - The abbreviation for the journey.
   * @param {string} channel - The channel through which the journey is initiated.
   * @param {object} globals
   */
function createJourneyId(visitMode, journeyAbbreviation, channel, globals) {
  const dynamicUUID = generateUUID();
  // var dispInstance = getDispatcherInstance();
  const journeyId = globals.functions.exportData().journeyId || `${dynamicUUID}_01_${journeyAbbreviation}_${visitMode}_${channel}`;
  globals.functions.setProperty(globals.form.runtime.journeyId, { value: journeyId });
}

/**
 * Changes the language of the Aadhar content to the specified language.
 * @param {Object} content - The content configuration for Aadhar.
 * @param {string} defaultLang - The language to show us default.
 */
// select dropdow-aadhar
const aadharLangChange = async (adharContentDom, defaultLang) => {
  const selectOp = adharContentDom.querySelector(`[name= ${'selectLanguage'}]`);
  const findFieldSet = adharContentDom?.querySelectorAll('fieldset');
  const selectedClass = 'selected-language';
  const defaultOptionClass = `field-aadharconsent-${defaultLang?.toLowerCase()}`;
  const applySelected = (fieldNode, optionClass, nameClass) => {
    fieldNode?.forEach((element) => {
      if (element?.classList?.contains(optionClass)) {
        element.style.display = 'block';
        element?.classList.add(nameClass);
      } else {
        element.style.display = 'none';
        element?.classList.remove(nameClass);
      }
    });
  };
  applySelected(findFieldSet, defaultOptionClass, selectedClass);
  const { CURRENT_FORM_CONTEXT } = (await import('./constants.js'));
  CURRENT_FORM_CONTEXT.languageSelected = defaultLang;
  selectOp.value = defaultLang;
  selectOp?.addEventListener('change', (e) => {
    e.preventDefault();
    const { value: valueSelected } = e.target;
    selectOp.value = valueSelected;
    CURRENT_FORM_CONTEXT.languageSelected = valueSelected;
    const optionClass = `field-aadharconsent-${valueSelected?.toLowerCase()}`;
    applySelected(findFieldSet, optionClass, selectedClass);
  });
};

export {
  createJourneyId,
  aadharLangChange,
};
