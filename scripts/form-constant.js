import semiFormContant from '../creditcards/semi/form-constant.js';

const FORM_CONSTANT = [
  semiFormContant,
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

export default FORM_CONSTANT;
