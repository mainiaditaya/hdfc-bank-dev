/**
 * Represents a layout manager for creating accordion-style UI components.
 */
export default function accordionLayout(panel) {
  const panelBody = panel.querySelector('.panel-wrapper:nth-child(3)');
  const legend = panel?.querySelector('.panel-wrapper .hdfc-accordian-legend button');
  legend?.addEventListener('click', () => {
    panelBody.classList.toggle('accordion-collapse');
    panelBody.style.display = (panelBody.style.display === 'none') ? '' : 'none';
  });
  return panel;
}
