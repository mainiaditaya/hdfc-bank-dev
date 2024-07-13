/**
 * Represents a layout manager for displaying floating field labels.
 */
export default function floatingFieldLayout(panel) {
  const inputField = panel.querySelector('input') || panel.querySelector('select');
  const wrapper = inputField?.closest('.field-wrapper');
  inputField?.addEventListener('focus', () => {
    wrapper.dataset.active = 'true';
    wrapper.dataset.empty = !inputField.value;
  });
  inputField?.addEventListener('blur', () => {
    delete wrapper.dataset.active;
    wrapper.dataset.empty = !inputField.value;
  });
  if (wrapper?.dataset) {
    wrapper.dataset.empty = !inputField.value;
  }
  return panel;
}
