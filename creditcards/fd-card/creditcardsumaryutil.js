import { CURRENT_FORM_CONTEXT } from '../../common/constants.js';

const creditCardSummary = (globals) => {
  const formData = globals.functions.exportData();
  const { resultPanel } = globals.form;
  const { successResultPanel } = resultPanel;
  const selectedCreditCard = CURRENT_FORM_CONTEXT?.selectedCreditCard || formData?.currentFormContext?.selectedCreditCard;
  globals.functions.setProperty(successResultPanel.tqSummarySection.tqNameOnCard, { value: formData.nameOnCard });
  globals.functions.setProperty(successResultPanel.tqSummarySection.tqAnnualCCFee, { value: selectedCreditCard?.annualFee !== '' ? Number(selectedCreditCard?.annualFee) : 0 });
  globals.functions.setProperty(successResultPanel.tqSummarySection.tqCreditLimit, { value: formData.eligibleCreditLimitAmount });
  const fdNumberSelection = formData.FDlienCard?.fdNumberSelection || [];
  const formattedFDs = fdNumberSelection.map((fd) => (
    { selectedFDNum: fd?.fdNumber?.toString() }
  ));
  globals.functions.importData({ items: formattedFDs }, successResultPanel.tqSummarySection.tqSelectedFDs.selectedFdsRepeatable.$qualifiedName);
};

export default creditCardSummary;
