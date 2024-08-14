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

export default createJourneyId;
