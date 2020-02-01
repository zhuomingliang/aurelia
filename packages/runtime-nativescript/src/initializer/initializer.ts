import { DI, IContainer, IRegistry, IResolver, Registration } from '@aurelia/kernel';
import { IDOM, IDOMInitializer, ISinglePageApp, IScheduler, DOM } from '@aurelia/runtime';
import { NsDOM, NsNode } from '../dom';

import { JSDOMScheduler } from './scheduler';

class NsDOMInitializer implements IDOMInitializer {

  public constructor(
    @IContainer private readonly container: IContainer,
  ) {}

  public static register(container: IContainer): IResolver<IDOMInitializer> {
    return Registration.singleton(IDOMInitializer, this).register(container);
  }

  public initialize(config?: ISinglePageApp<NsNode>): IDOM<NsNode> {
    if (this.container.has(IDOM, false)) {
      return this.container.get(IDOM) as IDOM<NsNode>;
    }
    console.log('NATIVESCRIPT DOM INITIALIZINGGGGGGGGGGG');
    const dom = this.container.get(NsDOM);
    Registration.instance(IDOM, dom).register(this.container);
    return dom;
  }
}

export const IDOMInitializerRegistration = NsDOMInitializer as IRegistry;
export const INsDOMSchedulerRegistration = JSDOMScheduler as IRegistry;

/**
 * Default HTML-specific, jsdom-specific implementations for the following interfaces:
 * - `IDOMInitializer`
 */
export const DefaultComponents = [
  IDOMInitializerRegistration,
  INsDOMSchedulerRegistration,
];
