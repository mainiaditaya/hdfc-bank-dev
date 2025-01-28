import {
  sampleRUM,
  buildBlock,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForLCP,
  loadBlocks,
  loadCSS,
  loadScript,
} from './aem.js';

import { getSubmitBaseUrl, setSubmitBaseUrl } from '../blocks/form/constant.js';

import { FORM_CONSTANT } from './form-constant.js';

const LCP_BLOCKS = []; // add your LCP blocks to the list

const ENV = getSubmitBaseUrl()?.includes('dev') ? 'dev' : 'prod';

/**
 * Builds hero block and prepends to main in a new section.
 * @param {Element} main The container element
 */
function buildHeroBlock(main) {
  const h1 = main.querySelector('h1');
  const picture = main.querySelector('picture');
  // eslint-disable-next-line no-bitwise
  if (h1 && picture && (h1.compareDocumentPosition(picture) & Node.DOCUMENT_POSITION_PRECEDING)) {
    const section = document.createElement('div');
    section.append(buildBlock('hero', { elems: [picture, h1] }));
    main.prepend(section);
  }
}

if ((typeof window !== 'undefined') && (typeof window.location !== 'undefined')) {
  const queryString = window.location.search;
  const params = new URLSearchParams(queryString);
  const isBlueGreenActive = params.get('isBGPrd');
  // eslint-disable-next-line no-console
  console.log(isBlueGreenActive);
  // const isReferrerAllowed = GREEN_ENV.some(hostname => GREEN_ENV.includes(hostname));
  if (isBlueGreenActive) {
    setSubmitBaseUrl('https://publish1apsouth1-b80-28947060.prod.hdfc.adobecqms.net');
  }
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    buildHeroBlock(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await waitForLCP(LCP_BLOCKS);
  }

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
    const pathName = window.location.pathname;
    FORM_CONSTANT.some((form) => {
      if (form.formPath.some((el) => pathName.includes(el))) {
        document.body.classList.add(form.class);
        if (form?.stylePath) {
          loadCSS(`${window.hlx.codeBasePath}${form?.stylePath}`);
        }
        return true;
      }
      return false;
    });
  } catch (e) {
    // do nothing
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  const main = doc.querySelector('main');
  await loadBlocks(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();

  sampleRUM('lazy');
  sampleRUM.observe(main.querySelectorAll('div[data-block-name]'));
  sampleRUM.observe(main.querySelectorAll('picture > img'));
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  const pathName = window.location.pathname;
  FORM_CONSTANT.some((form) => {
    if (form.urlKey.some((el) => pathName.includes(el))) {
      window.setTimeout(() => form?.launchScript?.[ENV] && loadScript(form?.launchScript?.[ENV]), form.launchScript.loadTime);
      return true;
    }
    return false;
  });
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
