const creditCardSummary = (globals) => {
  const formData = globals.functions.exportData();
  const { resultPanel } = globals.form;
  const { successResultPanel } = resultPanel;
  globals.functions.setProperty(successResultPanel.tqSummarySection.tqNameOnCard, { value: formData.nameOnCard });
  const fdNumberSelection = formData.FDlienCard?.fdNumberSelection || [];
  const formattedFDs = fdNumberSelection.map((fd) => (
    { selectedFDNumber: fd.fdNumber }
  ));
  globals.functions.importData({ items: formattedFDs }, successResultPanel.tqSummarySection.tqSelectedFDs.selectedFdsRepeatable.$qualifiedName);
};

export default creditCardSummary;
