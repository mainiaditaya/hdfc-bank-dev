const finalPagePanelVisibility = (formStatus, arn, globals) => {
  const {
    addressDeclarationPanel, resultPanel, fdBasedCreditCardWizard, docUploadFlow,
  } = globals.form;
  const { successResultPanel, errorResultPanel } = resultPanel;
  globals.functions.setProperty(addressDeclarationPanel, { visible: false });
  globals.functions.setProperty(fdBasedCreditCardWizard, { visible: false });
  globals.functions.setProperty(docUploadFlow, { visible: false });
  globals.functions.setProperty(resultPanel, { visible: true });
  if (formStatus === 'success') {
    globals.functions.setProperty(successResultPanel.refNumPanel.referenceNumber, { value: arn });

    globals.functions.setProperty(successResultPanel, { visible: true });
  } else {
    globals.functions.setProperty(errorResultPanel, { visible: true });
  }
};

export default finalPagePanelVisibility;
