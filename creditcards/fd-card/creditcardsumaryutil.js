import { CURRENT_FORM_CONTEXT } from '../../common/constants.js';

const creditCardSummary = (globals) => {
  const { functions, form } = globals;
  const { exportData, setProperty, importData } = functions;
  const { tqSummarySection } = form.resultPanel.successResultPanel;

  const formData = exportData();
  const selectedCreditCard = CURRENT_FORM_CONTEXT?.selectedCreditCard || formData?.currentFormContext?.selectedCreditCard || {};

  const { nameOnCard, eligibleCreditLimitAmount, FDlienCard = {} } = formData;
  const { annualFee = 0 } = selectedCreditCard;
  const fdNumberSelection = FDlienCard.fdNumberSelection || [];

  setProperty(tqSummarySection.tqNameOnCard, { value: nameOnCard });
  setProperty(tqSummarySection.tqAnnualCCFee, { value: Number(annualFee) });
  setProperty(tqSummarySection.tqCreditLimit, { value: eligibleCreditLimitAmount });

  const formattedFDs = fdNumberSelection.map((fd) => ({
    selectedFDNum: fd?.fdNumber?.toString(),
  }));

  importData({ items: formattedFDs }, tqSummarySection.tqSelectedFDs.selectedFdsRepeatable.$qualifiedName);
};

export default creditCardSummary;
