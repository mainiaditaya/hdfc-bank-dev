import {
  DEFAULT_OPTIONS, getAudienceAndOffers, getAudienceAttribute, refreshAudiencesAndOffers,
} from '../martech/index.js';
import { submitSuccess, submitFailure } from '../submit.js';
import {
  createHelpText, createLabel, updateOrCreateInvalidMsg, getCheckboxGroupValue, removeInvalidMsg,
} from '../util.js';
import registerCustomFunctions from './functionRegistration.js';
import { externalize } from './functions.js';
import initializeRuleEngineWorker from './worker.js';

function disableElement(el, value) {
  el.toggleAttribute('disabled', value === true);
  el.toggleAttribute('aria-readonly', value === true);
}
function setValue(formModel, fieldId, value) {
  if (formModel && value) {
    const field = formModel.getElement(fieldId);
    if (field) {
      if (field.fieldType === 'plain-text') {
        document.getElementById(fieldId).innerHTML = `<p><h4>${value}</h4></p>`;
      } else {
        field.value = value;
      }
    }
    formModel.getElement(fieldId).value = value || undefined;
  }
}
function applyOffers(properties, offers, formModel) {
  const data = {};
  if (properties?.placementFieldMappings) {
    const placementFieldMappings = JSON.parse(properties.placementFieldMappings);
    const offerCharacteristicMapping = JSON.parse(properties.offerCharacteristicMapping || '[]');
    placementFieldMappings?.forEach((mapping) => {
      const { placementId, fieldName, fieldId } = mapping;
      const offer = offers[placementId];
      if (offer) {
        if (formModel) {
          setValue(formModel, fieldId, offer?.content);
        } else {
          data[fieldName] = offer?.content || undefined;
        }
        if (offer?.characteristics) {
          Object.keys(offer?.characteristics).forEach((key) => {
            const { fieldId: id, fieldName: name } = offerCharacteristicMapping
              .find((x) => x.fieldName === key) || {};
            if (formModel && id) {
              setValue(formModel, id, offer?.characteristics?.[key]);
            } else {
              data[name] = offer?.characteristics?.[key];
            }
          });
        }
      }
    });
  }
  return data;
}

function compare(fieldVal, htmlVal, type) {
  if (type === 'number') {
    return fieldVal === Number(htmlVal);
  }
  if (type === 'boolean') {
    return fieldVal?.toString() === htmlVal;
  }
  return fieldVal === htmlVal;
}

function handleActiveChild(id, form) {
  form.querySelectorAll('[data-active="true"]').forEach((ele) => ele.removeAttribute('data-active'));
  const field = form.querySelector(`#${id}`);
  if (field) {
    field.closest('.field-wrapper').dataset.active = true;
    field.focus();
  }
}
async function fieldChanged(payload, form, generateFormRendition, formModel) {
  const { changes, field: fieldModel } = payload;
    const {
      id, fieldType, readOnly, type, displayValue, displayFormat, displayValueExpression,
    activeChild,
    } = fieldModel;
  const field = form.querySelector(`#${id}`);
  const fieldWrapper = field.closest('.field-wrapper');
  changes.forEach((change) => {
    const { propertyName, currentValue, prevValue } = change;
    if (!field) {
      return;
    }
    switch (propertyName) {
      case 'required':
        if (currentValue === true) {
          field.closest('.field-wrapper').dataset.required = '';
        } else {
          field.closest('.field-wrapper').removeAttribute('data-required');
        }
        break;
      case 'validationMessage':
        {
          const { validity } = payload.field;
          if (field.setCustomValidity
            && (validity?.expressionMismatch || validity?.customConstraint)) {
            field.setCustomValidity(currentValue);
            updateOrCreateInvalidMsg(field, currentValue);
          }
        }
        break;
      case 'value':
        if (['number', 'date', 'text', 'email'].includes(field.type) && (displayFormat || displayValueExpression)) {
          field.setAttribute('edit-value', currentValue);
          field.setAttribute('display-value', displayValue);
        } else if (fieldType === 'radio-group' || fieldType === 'checkbox-group') {
          field.querySelectorAll(`input[name=${id}]`).forEach((el) => {
            const exists = (Array.isArray(currentValue)
              && currentValue.some((x) => compare(x, el.value, type.replace('[]', ''))))
              || compare(currentValue, el.value, type);
            el.checked = exists;
          });
        } else if (field.type === 'select-multiple') {
          [...field.options].forEach((option) => {
            option.selected = currentValue.includes(option.value);
          });
        } else if (fieldType === 'checkbox') {
          field.checked = compare(currentValue, field.value, type);
        } else if (fieldType === 'plain-text') {
          field.innerHTML = currentValue;
        } else if (field.type !== 'file') {
          field.value = currentValue;
        }
        if (fieldModel && (fieldModel?.properties?.enableProfile || fieldModel?.name === 'aem_mobileNum')) {
          if (fieldModel?.name === 'aem_mobileNum') {
            fieldModel.properties.xdmDataRef = '_formsinternal01.pseudoID';
          }
          refreshAudiencesAndOffers(fieldModel.properties.xdmDataRef, currentValue)
            .then(({ audiences, offers }) => {
              const audienceId = getAudienceAttribute();
              const audienceLinkedField = formModel.getElement(audienceId);
              if (audienceLinkedField) {
                audienceLinkedField.value = audiences;
              }
              applyOffers(formModel.properties, offers, formModel);
            });
        }
        break;
      case 'visible':
        field.closest('.field-wrapper').dataset.visible = currentValue;
        break;
      case 'enabled':
        // If checkboxgroup/radiogroup/drop-down is readOnly then it should remain disabled.
        if (fieldType === 'radio-group' || fieldType === 'checkbox-group') {
          if (readOnly === false) {
            field.querySelectorAll(`input[name=${id}]`).forEach((el) => {
              disableElement(el, !currentValue);
            });
          }
        } else if (fieldType === 'drop-down') {
          if (readOnly === false) {
            disableElement(field, !currentValue);
          }
        } else {
          field.toggleAttribute('disabled', currentValue === false);
        }
        break;
      case 'readOnly':
        if (fieldType === 'radio-group' || fieldType === 'checkbox-group') {
          field.querySelectorAll(`input[name=${id}]`).forEach((el) => {
            disableElement(el, currentValue);
          });
        } else if (fieldType === 'drop-down') {
          disableElement(field, currentValue);
        } else {
          field.toggleAttribute('disabled', currentValue === true);
        }
        break;
      case 'label':
        // eslint-disable-next-line no-case-declarations
        if (fieldWrapper) {
          let labelEl = fieldWrapper.querySelector('.field-label');
          if (labelEl) {
            labelEl.textContent = currentValue.value;
            labelEl.setAttribute('data-visible', currentValue.visible);
          } else if (fieldType === 'button') {
            field.textContent = currentValue.value;
          } else if (currentValue.value !== '') {
            labelEl = createLabel({
              id,
              label: currentValue,
            });
            fieldWrapper.prepend(labelEl);
          }
        }
        break;
      case 'description':
        // eslint-disable-next-line no-case-declarations
        const fieldContainer = field.closest('.field-wrapper');
        if (fieldContainer) {
          let descriptionEl = fieldContainer.querySelector('.field-description');
          if (descriptionEl) {
            descriptionEl.innerHTML = currentValue;
          } else if (currentValue !== '') {
            descriptionEl = createHelpText({
              id,
              description: currentValue,
            });
            fieldContainer.append(descriptionEl);
          }
        }
        break;
      case 'items':
        if (currentValue === null) {
          const removeId = prevValue.id;
          field?.querySelector(`#${removeId}`)?.remove();
        } else {
          generateFormRendition({ items: [currentValue] }, field?.querySelector('.repeat-wrapper'));
        }
        break;
      case 'activeChild': handleActiveChild(activeChild, form);
        break;
      case 'valid':
        if (currentValue === true && field?.validity?.customError) {
          updateOrCreateInvalidMsg(field, '');
        }
        break;
      default:
        break;
    }
  });
  if (fieldWrapper?.dataset?.subscribe) {
    fieldWrapper.dataset.fieldModel = JSON.stringify(fieldModel);
  }
}

function formChanged(payload, form) {
  const { changes } = payload;
  changes.forEach((change) => {
    const { propertyName, currentValue } = change;
    switch (propertyName) {
      case 'activeChild': handleActiveChild(currentValue?.id, form);
        break;
      default:
        break;
    }
  });
}
function handleRuleEngineEvent(e, form, generateFormRendition, formModel) {
  const { type, payload } = e;
  if (type === 'fieldChanged') {
    fieldChanged(payload, form, generateFormRendition, formModel);
  } else if (type === 'change') {
    formChanged(payload, form);
  } else if (type === 'submitSuccess') {
    submitSuccess(e, form);
  } else if (type === 'submitFailure') {
    submitFailure(e, form);
  }
}

function applyRuleEngine(htmlForm, form, captcha) {
  htmlForm.addEventListener('change', (e) => {
    const field = e.target;
    const {
      id, value, name, checked,
    } = field;
    const fieldModel = form.getElement(id);
    if ((field.type === 'checkbox' && field.dataset.fieldType === 'checkbox-group')) {
      const val = getCheckboxGroupValue(name, htmlForm);
      const el = form.getElement(name);
      el.value = val;
    } else if ((field.type === 'radio' && field.dataset.fieldType === 'radio-group')) {
      const el = form.getElement(name);
      el.value = value;
    } else if (field.type === 'checkbox') {
      fieldModel.value = checked ? value : field.dataset.uncheckedValue;
    } else if (field.type === 'file') {
      fieldModel.value = Array.from(e?.detail?.files || field.files);
    } else if (field.selectedOptions) {
      fieldModel.value = [...field.selectedOptions].map((option) => option.value);
    } else {
      fieldModel.value = value;
    }
    // console.log(JSON.stringify(form.exportData(), null, 2));
  });
  htmlForm.addEventListener('focusin', (e) => {
    const field = e.target;
    let { id } = field;
    if (['radio', 'checkbox'].includes(field?.type)) {
      id = field.closest('.field-wrapper').dataset.id;
    }
    form.getElement(id)?.focus();
  });

  htmlForm.addEventListener('click', async (e) => {
    if (e.target.tagName === 'BUTTON') {
      const element = form.getElement(e.target.id);
      if (e.target.type === 'submit' && captcha) {
        const token = await captcha.getToken();
        form.getElement(captcha.id).value = token;
      }
      if (element) {
        element.dispatch({ type: 'click' });
      }
    }
  });
}

export async function loadRuleEngine(formDef, htmlForm, captcha, genFormRendition, data) {
  const ruleEngine = await import('./model/afb-runtime.js');
  const form = ruleEngine.restoreFormInstance(formDef, data);
  window.myForm = form;

  form.subscribe((e) => {
    handleRuleEngineEvent(e, htmlForm, genFormRendition, form);
  }, 'fieldChanged');
  form.subscribe((e) => {
    handleRuleEngineEvent(e, htmlForm, genFormRendition, form);
  }, 'change');

  form.subscribe((e) => {
    handleRuleEngineEvent(e, htmlForm);
  }, 'submitSuccess');

  form.subscribe((e) => {
    handleRuleEngineEvent(e, htmlForm);
  }, 'submitFailure');

  form.subscribe((e) => {
    handleRuleEngineEvent(e, htmlForm);
  }, 'submitError');
  applyRuleEngine(htmlForm, form, captcha);
}

async function fetchData({ id }) {
  try {
    const { search = '' } = window.location;
    const url = externalize(`/adobe/forms/af/data/${id}${search}`);
    const response = await fetch(url);
    const json = await response.json();
    const { data: prefillData } = json;
    const { data: { afData: { afBoundData: { data = {} } = {} } = {} } = {} } = json;
    return Object.keys(data).length > 0 ? data : (prefillData || json);
  } catch (ex) {
    return {};
  }
}

export async function initAdaptiveForm(formDef, createForm) {
  const segmentsStr = formDef?.properties?.segments;
  const segments = segmentsStr ? JSON.parse(segmentsStr) : [];
  const { audiences, offers } = await getAudienceAndOffers(segments);
  const prefillData = {}; // await fetchData(formDef);
  const offersData = applyOffers(formDef.properties, offers);
  offersData[DEFAULT_OPTIONS.audiencesDataAttribute] = audiences;
  await registerCustomFunctions(formDef?.id);
  const form = await initializeRuleEngineWorker({
    ...formDef,
    data: { ...prefillData, ...offersData },
  }, createForm);
  return form;
}
