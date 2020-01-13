import { DI, IContainer } from '@aurelia/kernel';
import { RuntimeConfiguration } from '@aurelia/runtime';

export const DefaultComponents = [

];

export const DefaultResources = [

];

export const DefaultRenderers = [

];

export const RuntimeNativeScriptConfiguration = {
  register(container: IContainer): IContainer {
    return RuntimeConfiguration
      .register(container)
      .register(
        ...DefaultComponents,
        ...DefaultResources,
        ...DefaultRenderers
      );
  },
  createContainer(): IContainer {
    return this.register(DI.createContainer());
  },
};
