import { CURRENT_FORM_CONTEXT } from '../../common/constants.js';

const creditCardSummary = (globals) => {
  const { functions, form } = globals;
  const { exportData, setProperty, importData } = functions;
  const { tqSummarySection } = form.resultPanel.successResultPanel.tqSuccessWrapper;

  const formData = exportData();
  const selectedCreditCard = CURRENT_FORM_CONTEXT?.selectedCreditCard || formData?.currentFormContext?.selectedCreditCard || {};

  const { eligibleCreditLimitAmount, FDlienCard = {} } = formData;
  const { annualFee = 0 } = selectedCreditCard;
  const fdNumberSelection = FDlienCard.fdNumberSelection || [];
  const nameOnCard = formData?.nameOnCard
  || formData?.currentFormContext?.executeInterfaceRequest?.requestString?.nameOnCard
  || formData?.FDlienCard?.nameOnCard
  || CURRENT_FORM_CONTEXT?.executeInterfaceRequest?.requestString?.nameOnCard
  || '';
  setProperty(tqSummarySection?.tqNameOnCard, { value: nameOnCard });
  setProperty(tqSummarySection?.tqAnnualCCFee, { value: String(annualFee) });
  setProperty(tqSummarySection?.tqCreditLimit, { value: eligibleCreditLimitAmount });

  const formattedFDs = fdNumberSelection.reduce((acc, fd) => {
    if (fd.fdAccSelect === 'on') {
      acc.push({ selectedFDNum: fd?.fdNumber?.toString() });
    }
    return acc;
  }, []);

  importData({ items: formattedFDs }, tqSummarySection?.tqSelectedFDs?.selectedFdsRepeatable?.$qualifiedName);
};

export default creditCardSummary;
