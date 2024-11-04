/**
 * Represents a layout manager for creating accordion-style UI components.
 */

let currentlyOpenPanel = null;
export default function accordionLayout(panel) {
  const legend = panel?.querySelector('legend');
  legend?.classList.add('hdfc-accordion-legend');

  legend?.addEventListener('click', () => {
    if (currentlyOpenPanel && currentlyOpenPanel !== panel) {
      const currentlyOpenLegend = currentlyOpenPanel.querySelector('legend');
      currentlyOpenLegend.classList.remove('accordion-collapse');

      Array.from(currentlyOpenPanel.children).forEach((childElement) => {
        if (childElement !== currentlyOpenLegend) {
          childElement.style.display = 'none';
        }
      });
    }

    legend.classList.toggle('accordion-collapse');

    Array.from(panel.children).forEach((childElement) => {
      if (childElement !== legend) {
        childElement.style.display = (childElement.style.display === 'none') ? '' : 'none';
      }
    });

    currentlyOpenPanel = legend.classList.contains('accordion-collapse') ? panel : null;
  });

  if (!currentlyOpenPanel) {
    legend.click();
  }

  return panel;
}
