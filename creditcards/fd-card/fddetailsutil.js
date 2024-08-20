/* eslint-disable no-underscore-dangle */
import { formatDateDDMMMYYY } from '../../common/formutils.js';
import { SELECTED_CUSTOMER_ID } from './customeridutil.js';
import { MAXIMUM_CREDIT_AMOUNT } from './constant.js';

const updateData = (globals, fd, panel) => {
  const datMaturity = formatDateDDMMMYYY(fd.datMaturity);
  const balPrincipal = Number(fd.balPrincipal);
  globals.functions.setProperty(panel.fdNumber, { value: fd.fdAccountNo });
  globals.functions.setProperty(panel.selectedFDAmount, { value: balPrincipal });
  globals.functions.setProperty(panel.maturingDate, { value: datMaturity });
};

/**
 * Binds customer details from the global context to the current form.
 * @name customerIdProceedHandler
 * @param {Object} globals - The global context object containing various information.
 */
const customerIdProceedHandler = (globals) => {
  const { selectedCustId } = SELECTED_CUSTOMER_ID;
  const selectedCustIdFds = selectedCustId?.listFDSummary;
  const fdSelectionInfoPanel = globals.form.fdBasedCreditCardWizard.selectFD.fdSelectionInfo;
  const fdNumberSelectionPanel = fdSelectionInfoPanel.fdNumberSelection;

  selectedCustIdFds.forEach((fd, i) => {
    if (i < selectedCustIdFds.length - 1) {
      globals.functions.dispatchEvent(fdNumberSelectionPanel, 'addItem');
    }
    setTimeout(() => {
      updateData(globals, fd, fdNumberSelectionPanel[i]);
    }, i * 40);
  });
  const selectedFDNumPanel = fdSelectionInfoPanel.selectedFDPanel.selectedFDNum;
  const fdCountPanel = fdSelectionInfoPanel.selectedFDPanel.selectedFDNumMax;
  globals.functions.setProperty(selectedFDNumPanel, '0');
  globals.functions.setProperty(fdCountPanel, selectedCustIdFds.length);
};

const updateCreditLimit = (selectedFDsAmt, globals) => {
  const fdSelectionInfoPanel = globals.form.fdBasedCreditCardWizard.selectFD.fdSelectionInfo;
  const selectedFDNumPanel = fdSelectionInfoPanel.selectedFDPanel.selectedFDNum;

  globals.functions.setProperty(selectedFDNumPanel, { value: selectedFDsAmt.length });

  const creditLimitPanel = fdSelectionInfoPanel.selectFDDetailsPanel.creditLimit;

  const totalSelectedAmount = selectedFDsAmt.reduce((acc, val) => acc + val, 0);
  const creditAmt = totalSelectedAmount * 0.9;
  const actualCreditAmount = Math.min(creditAmt, MAXIMUM_CREDIT_AMOUNT).toFixed(2);

  globals.functions.setProperty(creditLimitPanel, { value: selectedFDsAmt.length === 0 ? 0 : actualCreditAmount });
};

/**
 * Handles on select of customer ID radio button.
 * @name fdSelectHandler
 * @param {Object} fdPanel
 * @param {Object} globals
 */
const fdSelectHandler = (fdPanel, globals) => {
  const selectedFDsAmt = [];
  fdPanel.forEach((item) => {
    if (item.fdAccSelect._data.$_value === 'on') {
      selectedFDsAmt.push(Number(item.selectedFDAmount._data.$_value));
    }
  });
  updateCreditLimit(selectedFDsAmt, globals);
};

/**
 * Handles on select of customer ID radio button.
 * @name selectAllFdClickHandler
 * @param {Object} globals
 */
const selectAllFdClickHandler = (globals) => {
  const selectedFDsAmt = [];
  const fdNumberSelectionPanel = globals.form.fdBasedCreditCardWizard.selectFD.fdSelectionInfo.fdNumberSelection;
  fdNumberSelectionPanel.forEach((item) => {
    globals.functions.setProperty(item.fdAccSelect, { value: 'on' });
    selectedFDsAmt.push(Number(item.selectedFDAmount._data.$_value));
  });
  updateCreditLimit(selectedFDsAmt, globals);
};

export {
  customerIdProceedHandler,
  fdSelectHandler,
  selectAllFdClickHandler,
};
