import semiFormContant from '../creditcards/semi/semi-form-constant.js';

const otherForms = {
  '/content/forms/af/hdfc_haf/cards/corporatecreditcard/uat/hdfc': '../../../creditcards/corporate-creditcard/cc-functions.js', // cc
  '/content/forms/af/hdfc_haf/digital/etb-fixed-deposit-cc': '../../../creditcards/fd-card/fd-functions.js', // fd
  '/content/forms/af/hdfc_haf/digital/corporate-credit-cards-application-form': '../../../creditcards/corporate-creditcard/cc-functions.js',
  '/content/forms/af/hdfc_haf/digital/pvtestfdliencugtest': '../../../creditcards/fd-card/fd-functions.js', // fd
  '/content/forms/af/hdfc_haf/digital/fd-lien-cug': '../../../creditcards/fd-card/fd-functions.js', // fd
  '/content/forms/af/hdfc_haf/digital/corporate-credit-cards-application-cug': '../../../creditcards/corporate-creditcard/cc-functions.js', // ccc cug
  '/content/forms/af/hdfc_haf/digital/fdlienprodtest': '../../../creditcards/fd-card/fd-functions.js', // fd form
  '/content/forms/af/hdfc_haf/digital/account-opening-nre-nro': '../../../liabilities/nre-Nro/nre-nro.js',
};

const otherFormConst = [
  {
    // CC
    formPath: ['corporate-credit-card', 'corporate_credit_cards', 'corporate credit cards', 'corporatecreditcard'],
    class: '',
    urlKey: ['corporate-credit-card', 'corporate_credit_cards', 'corporate credit cards', 'corporatecreditcard'],
    launchScript: {
      dev: 'https://assets.adobedtm.com/80673311e435/029b16140ccd/launch-230317469f6b-development.min.js',
      prod: 'https://assets.adobedtm.com/80673311e435/029b16140ccd/launch-39d52f236cd6.min.js',
      loadTime: 1200,
    },
  },
  {
    // NRE NRO
    formPath: ['nre-nro', 'account-opening-nre-nro'],
    class: 'nre',
    urlKey: ['nre-nro', 'account-opening-nre-nro'],
    launchScript: {
      dev: 'https://assets.adobedtm.com/80673311e435/029b16140ccd/launch-e17de29eec01-development.min.js',
      prod: 'https://assets.adobedtm.com/80673311e435/029b16140ccd/launch-39d52f236cd6.min.js',
      loadTime: 3600,
    },
  },
  {
    formPath: ['etb-fixed-deposit-cc', 'pvtestfdliencugtest', 'fd-lien-cug-test', 'fdlienprodtest'],
    class: 'fdlien',
    urlKey: ['fdlien', 'pvtestfdliencugtest', 'fd-lien-cug-test', 'etb-fixed-deposit-cc', 'fdlienprodtest'],
    launchScript: {
      dev: 'https://assets.adobedtm.com/80673311e435/029b16140ccd/launch-a47f215bcdb9-development.min.js',
      prod: 'https://assets.adobedtm.com/80673311e435/029b16140ccd/launch-39d52f236cd6.min.js',
      loadTime: 1200,
    },
  },
];

const mapFormPath = (paths, rootPath) => paths?.reduce((acc, path) => {
  acc[path] = rootPath;
  return acc;
}, {});

const semiFormPath = mapFormPath(semiFormContant.functionsFormPaths, semiFormContant.functionsExportPath);

const formIdPathMapping = {
  ...otherForms,
  ...semiFormPath,
};

const FORM_CONSTANT = [
  semiFormContant,
  ...otherFormConst,
];

export {
  formIdPathMapping,
  FORM_CONSTANT,
};
