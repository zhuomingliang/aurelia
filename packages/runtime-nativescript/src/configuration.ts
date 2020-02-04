import { DI, IContainer, IRegistry } from '@aurelia/kernel';
import { RuntimeConfiguration } from '@aurelia/runtime';
import {
  ListenerBindingRenderer,
  NsTextBindingRenderer,
} from './renderers';
import { TargetAccessorLocator, TargetObserverLocator } from './observation/observer-locator';
import { NsProjectorLocator } from './implementation/projectors';

import {
  NsXmlParser,
} from './implementation/xml-parser';

import {
  IDOMInitializerRegistration,
  INsDOMSchedulerRegistration
} from './initializer/initializer'
import { NsDOM } from './dom';
import { ViewComposer } from './view-composer';

export const IProjectorLocatorRegistration = NsProjectorLocator as IRegistry;
export const ITargetAccessorLocatorRegistration = TargetAccessorLocator as IRegistry;
export const ITargetObserverLocatorRegistration = TargetObserverLocator as IRegistry;

/**
 * Default NS-specific (but environment-agnostic) implementations for the following interfaces:
 * - `IProjectorLocator`
 * - `ITargetAccessorLocator`
 * - `ITargetObserverLocator`
 * - `ITemplateFactory`
 */
export const DefaultComponents = [
  IProjectorLocatorRegistration,
  ITargetAccessorLocatorRegistration,
  ITargetObserverLocatorRegistration,
];

export const DefaultImplementations = [
  NsDOM,
  NsXmlParser,
  ViewComposer,
  IDOMInitializerRegistration,
  INsDOMSchedulerRegistration,
];

/**
 * Default NS-specific (but environment-agnostic) resources:
 * - Binding Behaviors: `attr`, `self`, `updateTrigger`
 * - Custom Elements: `au-compose`
 * - Custom Attributes: `blur`, `focus`, `portal`
 */
export const DefaultResources = [
];

export const ListenerBindingRendererRegistration = ListenerBindingRenderer as unknown as IRegistry;
export const TextBindingRendererRegistration = NsTextBindingRenderer as unknown as IRegistry;

/**
 * Default NS-specfic (but environment-agnostic) renderers for:
 * - Listener Bindings: `trigger`, `capture`, `delegate`
 * - SetAttribute
 * - StyleProperty: `style`, `css`
 * - TextBinding: `${}`
 */
export const DefaultRenderers = [
  ListenerBindingRendererRegistration,
  TextBindingRendererRegistration
];

/**
 * A DI configuration object containing NS-specific (but environment-agnostic) registrations:
 * - `RuntimeConfiguration` from `@aurelia/runtime`
 * - `DefaultComponents`
 * - `DefaultResources`
 * - `DefaultRenderers`
 */
export const RuntimeNsConfiguration = {
  /**
   * Apply this configuration to the provided container.
   */
  register(container: IContainer): IContainer {
    return RuntimeConfiguration
      .register(container)
      .register(
        ...DefaultImplementations,
        ...DefaultComponents,
        ...DefaultResources,
        ...DefaultRenderers
      );
  },
  /**
   * Create a new container with this configuration applied to it.
   */
  createContainer(): IContainer {
    return this.register(DI.createContainer());
  }
};
