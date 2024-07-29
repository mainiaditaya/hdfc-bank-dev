// eslint-disable-next-line import/no-cycle
import { sampleRUM } from './aem.js';
import { sendPageloadEvent } from '../common/analytics.js';
import { CURRENT_FORM_CONTEXT as currentFormContext } from '../common/constants.js';

// Core Web Vitals RUM collection
sampleRUM('cwv');

sendPageloadEvent(currentFormContext);
// add more delayed functionality here
