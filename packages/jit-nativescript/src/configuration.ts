import {
  DefaultBindingLanguage as JitDefaultBindingLanguage,
  DefaultBindingSyntax as JitDefaultBindingSyntax,
  DefaultComponents as JitDefaultComponents
} from '@aurelia/jit';
import { DI, IContainer, IRegistry } from '@aurelia/kernel';
import {
  RefBindingCommand,
  TriggerBindingCommand
} from './binding-commands';
import { NsAttrSyntaxTransformer } from './ns-attribute-syntax-transformer';
import { TemplateCompiler } from './template-compiler';
import { NsTemplateElementFactory } from './template-element-factory';
import { RuntimeNsConfiguration } from '@aurelia/runtime-nativescript';

export const ITemplateCompilerRegistration = TemplateCompiler as IRegistry;
export const ITemplateElementFactoryRegistration = NsTemplateElementFactory as IRegistry;
export const IAttrSyntaxTransformerRegistation = NsAttrSyntaxTransformer as IRegistry;

/**
 * Default Ns-specific (but environment-agnostic) implementations for the following interfaces:
 * - `ITemplateCompiler`
 * - `ITemplateElementFactory`
 */
export const DefaultComponents = [
  ITemplateCompilerRegistration,
  ITemplateElementFactoryRegistration,
  IAttrSyntaxTransformerRegistation
];

export const RefBindingCommandRegistration = RefBindingCommand as unknown as IRegistry;
export const TriggerBindingCommandRegistration = TriggerBindingCommand as unknown as IRegistry;

/**
 * Default Ns-specific (but environment-agnostic) binding commands:
 * - Event listeners: `.trigger`, `.delegate`, `.capture`
 */
export const DefaultBindingLanguage = [
  RefBindingCommandRegistration,
  TriggerBindingCommandRegistration,
];

/**
 * A DI configuration object containing Ns-specific (but environment-agnostic) registrations:
 * - `RuntimeHtmlConfiguration` from `@aurelia/runtime-NS`
 * - `DefaultComponents` from `@aurelia/jit`
 * - `DefaultBindingSyntax` from `@aurelia/jit`
 * - `DefaultBindingLanguage` from `@aurelia/jit`
 * - `DefaultComponents`
 * - `DefaultBindingLanguage`
 */
export const JitNsConfiguration = {
  /**
   * Apply this configuration to the provided container.
   */
  register(container: IContainer): IContainer {
    return RuntimeNsConfiguration
      .register(container)
      .register(
        ...JitDefaultComponents,
        ...JitDefaultBindingSyntax,
        ...JitDefaultBindingLanguage,
        ...DefaultComponents,
        ...DefaultBindingLanguage
      );
  },
  /**
   * Create a new container with this configuration applied to it.
   */
  createContainer(): IContainer {
    return this.register(DI.createContainer());
  }
};
