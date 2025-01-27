import { registerFunctions } from './model/afb-runtime.js';
import getCustomFunctionPath from '../functions.js';

export default async function registerCustomFunctions(id) {
  try {
    // eslint-disable-next-line no-inner-declarations
    function registerFunctionsInRuntime(module) {
      const keys = Object.keys(module);
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < keys.length; i++) {
        const name = keys[i];
        const funcDef = module[keys[i]];
        if (typeof funcDef === 'function') {
          const functions = [];
          functions[name] = funcDef;
          registerFunctions(functions);
        }
      }
    }

    const ootbFunctionModule = await import('./functions.js');
    registerFunctionsInRuntime(ootbFunctionModule);
    const customFunctionPath = getCustomFunctionPath(id);
    const customFunctionModule = await import(`${customFunctionPath}`);
    registerFunctionsInRuntime(customFunctionModule);
  } catch (e) {
    console.log(`error occured while registering custom functions in web worker ${e.message}`);
  }
}
