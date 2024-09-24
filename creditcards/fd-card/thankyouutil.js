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

const ratingButtonUI = () => {
  document.querySelectorAll('.field-ratingbuttons .button').forEach((button) => {
    button.addEventListener('click', function ratingClick() {
      document.querySelectorAll('.field-ratingbuttons .button').forEach((btn) => {
        btn.classList.remove('active');
      });
      this.classList.add('active');
    });
  });
};

export {
  finalPagePanelVisibility,
  ratingButtonUI,
};
