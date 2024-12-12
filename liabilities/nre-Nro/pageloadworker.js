import {
  CURRENT_FORM_CONTEXT as currentFormContext,
} from '../../common/constants.js';
import {
  data,
  ANALYTICS_PAGE_LOAD_OBJECT,
  ANALYTICS_CLICK_OBJECT,
  PAGE_NAME,
} from './nreNroAnalyticsConstants.js';
import { FORM_NAME } from './constant.js';
import {
  createDeepCopyFromBlueprint,
} from '../../common/formutils.js';

const thanks = document?.querySelector('[name="thankYouPanel"]');

function setBodyPage(thanks) {
  if (thanks) {
    if (window && document && typeof _satellite !== 'undefined') {
      console.log(currentFormContext);
      thanks = document.querySelector('[name="thankYouPanel"]');
      const errorPanel = document.querySelector('[name="itsNotYouPanel"]');
      const errorConnectionPanel = document.querySelector('[name="errorConnection"]');
      if (!thanks?.dataset?.visible) {
        document.body.classList.add('nreThankYouPage');
        document.body.classList.remove('errorPageBody');

        // On Click Analytics
        document.querySelector('.field-hdfcbankwebsite a')?.addEventListener('click', function() {
          const digitalData = createDeepCopyFromBlueprint(ANALYTICS_CLICK_OBJECT);
          const linkName = 'HDFC Bank Website Link Click';
          const attributes = data[linkName];
          const linkType = attributes?.linkType;
          digitalData.link = {
            linkName,
            linkType,
          };
          digitalData.link.linkPosition = data[linkName].linkPosition;
          digitalData.user.pseudoID = '';
          digitalData.user.journeyName = currentFormContext?.journeyName;
          digitalData.user.journeyID = document.querySelector(".field-journeyid input")?.value ?? '';
          digitalData.user.journeyState = 'CUSTOMER_ONBOARDING_COMPLETE';
          digitalData.form.name = FORM_NAME;
          digitalData.user.casa = '';
          digitalData.page.pageInfo.pageName = PAGE_NAME.nrenro[linkName];

          if (window) {
            window.digitalData = digitalData || {};
          }
          _satellite.track('event');
        });

        document.querySelector('.field-applyfora a')?.addEventListener('click', function() {
          const digitalData = createDeepCopyFromBlueprint(ANALYTICS_CLICK_OBJECT);
          const linkName = 'Apply for a CTA Click';
          const attributes = data[linkName];
          const linkType = attributes?.linkType;
          digitalData.link = {
            linkName,
            linkType,
          };
          digitalData.link.linkPosition = data[linkName].linkPosition;
          digitalData.user.pseudoID = '';
          digitalData.user.journeyName = currentFormContext?.journeyName;
          digitalData.user.journeyID = document.querySelector(".field-journeyid input")?.value ?? '';
          digitalData.user.journeyState = 'CUSTOMER_ONBOARDING_COMPLETE';
          digitalData.form.name = FORM_NAME;
          digitalData.user.casa = '';

          digitalData.page.pageInfo.pageName = PAGE_NAME.nrenro[linkName];

          if (window) {
            window.digitalData = digitalData || {};
          }
          _satellite.track('event');
        });

        const params = new URLSearchParams(window.location.search);
        // Setting Analytics for Thank You PageLoad
        const digitalData = createDeepCopyFromBlueprint(ANALYTICS_PAGE_LOAD_OBJECT);
        digitalData.page.pageInfo.pageName = 'Step 5 - Confirmation' ?? '';
        digitalData.page.pageInfo.errorAPI = document.querySelector(".field-apiname input")?.value ?? ''
        digitalData.page.pageInfo.errorCode = document.querySelector(".field-errorcode input")?.value ?? '';
        digitalData.page.pageInfo.errorMessage = document.querySelector(".field-errormessage input")?.value ?? '';
        digitalData.user.pseudoID = '';// Need to check
        digitalData.user.journeyName = currentFormContext?.journeyName;
        digitalData.user.journeyID = document.querySelector(".field-journeyid input")?.value ?? '';
        digitalData.user.journeyState = 'CUSTOMER_ONBOARDING_COMPLETE';
        digitalData.user.casa = '';
        digitalData.form.name = FORM_NAME;
        digitalData.formDetails.accountType = document.querySelector(".field-accounttype input").value ?? '';
        digitalData.formDetails.branchCode = document.querySelector(".field-branchcode input").value ?? '';
        digitalData.formDetails.bankBranch = document.querySelector(".field-homebranch input").value ?? '';
        digitalData.event.authMethod = params?.get('authmode') ?? '';
        digitalData.formDetails.formSubmitted = '1';

        if (window) {
          window.digitalData = digitalData || {};
        }

        // setTimeout(() => {
          _satellite.track('pageload');
        // }, 2000);
      }
      if (!errorPanel?.dataset?.visible) {
        document.body.classList.remove('nreThankYouPage');
        document.body.classList.add('errorPageBody');
      }
      if (!errorConnectionPanel?.dataset?.visible) {
        document.body.classList.remove('nreThankYouPage');
        document.body.classList.add('errorPageBody');
      }

      // document.body.classList.add('preloader');
      const mutationCallback = (mutationsList) => {
        for (const mutation of mutationsList) {
          const dataVisibileValue = mutation.target.getAttribute('data-visible');
          const currTarget = mutation.target.name;
          if (!dataVisibileValue) {
            document.body.classList.remove('preloader');
            switch (currTarget) {
              case 'thankYouPanel':
                document.body.classList.add('nreThankYouPage');
                document.body.classList.remove('errorPageBody');
                break;
              case 'itsNotYouPanel':
                document.body.classList.add('errorPageBody');
                document.body.classList.remove('nreThankYouPage');
                break;
              case 'errorConnection':
                document.body.classList.add('errorPageBody');
                document.body.classList.remove('nreThankYouPage');
                break;
              default:
                break;
            }
          }
        }
      };
      const observer = new MutationObserver(mutationCallback);
      if (thanks) {
        observer.observe(thanks, { attributes: true });
      }
      if (errorPanel) {
        observer.observe(errorPanel, { attributes: true });
      }
      if (errorConnectionPanel) {
        observer.observe(errorConnectionPanel, { attributes: true });
      }
    } else{
      setTimeout(() => {
        if (window && document) {
          thanks = document.querySelector('[name="thankYouPanel"]');
          setBodyPage(thanks);
        }
      }, 500);
    }
  } else {
    setTimeout(() => {
      if (window && document) {
        thanks = document.querySelector('[name="thankYouPanel"]');
        setBodyPage(thanks);
      }
    }, 500);
  }
}

// function removeIDCOMQueryParameter() {
//   const url = new URL(window.location.href);
//   url.searchParams.delete('success');
//   url.searchParams.delete('authcode');
//   url.searchParams.delete('journeyId');
//   url.searchParams.delete('authmode');
//   url.searchParams.delete('errorCode');
//   url.searchParams.delete('errorMessage');
//   window.history.pushState({}, '', url);
// }

setBodyPage();
// removeIDCOMQueryParameter();