import { createFormInstance } from './model/afb-runtime.js';
import registerCustomFunctions from './functionRegistration.js';

let customFunctionRegistered = false;

export default class RuleEngine {
  rulesOrder = {};
  fieldChanges = [];

  constructor(formDef) {
    this.form = createFormInstance(formDef);
    this.form.subscribe((e) => {
      this.fieldChanges.push(e._action.payload)
    }, 'fieldChanged');
  }

  getState() {
    return this.form.getState(true);
  }

  getFieldChanges() {
    return this.fieldChanges;
  }
}

let ruleEngine;
onmessage = (e) => {
  function handleMessageEvent(event) {
    switch (event.data.name) {
      case 'init':
        ruleEngine = new RuleEngine(event.data.payload);
        // eslint-disable-next-line no-case-declarations
        const state = ruleEngine.getState();
        postMessage({
          name: 'init',
          payload: state,
        });
        ruleEngine.dispatch = (msg) => {
          postMessage(msg);
        };
        break;
      default:
        break;
    }
  }
  
   // sending the fieldChange events back to main thread once html form is rendered
   if(e.data.name === 'initComplete' && ruleEngine) {
    ruleEngine.getFieldChanges().forEach((changes) => {
      postMessage({
        name: 'fieldChanged',
        payload: changes,
      });
    })
  }

  if (!customFunctionRegistered) {
    const { id } = e.data.payload;
    registerCustomFunctions(id).then(() => {
      customFunctionRegistered = true;
      handleMessageEvent(e);
    });
  }
};
