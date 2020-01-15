import {
  DefaultBindingLanguage as JitDefaultBindingLanguage,
  DefaultBindingSyntax as JitDefaultBindingSyntax,
  DefaultComponents as JitDefaultComponents
} from '@aurelia/jit';
import { DI, IContainer } from '@aurelia/kernel';
// import { RuntimeNativeScriptConfiguration } from '@aurelia/runtime-nativescript';

/**
 * Default HTML-specific (but environment-agnostic) implementations for the following interfaces:
 * - `ITemplateCompiler`
 * - `ITemplateElementFactory`
 */
export const DefaultComponents = [

];

export const DefaultBindingLanguage = [

];

export const JitNativeScriptConfiguration = {
  register(container: IContainer): IContainer {
    return container;
    // return RuntimeNativeScriptConfiguration
    //   .register(container)
    //   .register(
    //     ...JitDefaultComponents,
    //     ...JitDefaultBindingSyntax,
    //     ...JitDefaultBindingLanguage,
    //     ...DefaultComponents,
    //     ...DefaultBindingLanguage
    //   );
  },
  createContainer(): IContainer {
    return this.register(DI.createContainer());
  },
};
