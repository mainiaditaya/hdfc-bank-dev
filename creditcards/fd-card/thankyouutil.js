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
    globals.functions.setProperty(successResultPanel?.tqSuccessWrapper?.refNumPanel?.referenceNumber, { value: arn });
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
      const ratingValue = this.textContent;
      const captureRatingInput = document.querySelector('input[name="captureRating"]');
      if (captureRatingInput) {
        captureRatingInput.value = ratingValue;
      }
    });
  });
};

const copyToClipBoard = async () => {
  const referenceNumberLabel = document.querySelector('.field-referencenumber label');
  const referenceNumberInput = document.querySelector('.field-referencenumber input');
  if (referenceNumberInput) {
    try {
      await navigator.clipboard.writeText(referenceNumberInput.value);
      alert(`Copied ${referenceNumberLabel.textContent} ${referenceNumberInput.value}`);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  }
};

export {
  finalPagePanelVisibility,
  ratingButtonUI,
  copyToClipBoard,
};
