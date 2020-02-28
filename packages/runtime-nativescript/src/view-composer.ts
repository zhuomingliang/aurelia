import { DI, Constructable, IContainer, Registration } from '@aurelia/kernel';
import { ICustomElementViewModel, Controller, ILifecycle, LifecycleFlags, getRenderContext, INode, CustomElement } from '@aurelia/runtime';
import { NsView } from './dom';
import { Frame } from '@nativescript/core';
import { appendManyChildViews } from './ns-view-utils';

export interface IViewComposer {
  compose<T extends NsView = NsView>(
    comp: Constructable<ICustomElementViewModel<T>>,
    HostType: Constructable<T>
  ): T;
  compose<T extends NsView = NsView>(comp: Constructable<ICustomElementViewModel<T>>, HostType: Constructable<T>, parentContainer: IContainer): T;
}

export const IViewComposer = DI.createInterface<IViewComposer>('IViewComposer').noDefault();

export class ViewComposer implements IViewComposer {

  static register(container: IContainer): void {
    Registration.singleton(IViewComposer, this).register(container);
  }

  public constructor(
    @IContainer private readonly container: IContainer
  ) {}

  public compose<T extends NsView = NsView>(comp: Constructable<ICustomElementViewModel<T>>, HostType: Constructable<T>): T;
  public compose<T extends NsView = NsView>(comp: Constructable<ICustomElementViewModel<T>>, HostType: Constructable<T>, parentContainer: IContainer): T;
  public compose<T extends NsView = NsView>(comp: Constructable<ICustomElementViewModel<T>>, HostType: Constructable<T>, parentContainer?: IContainer): T {
    parentContainer = parentContainer ?? this.container;
    const childContainer = parentContainer.createChild();
    const host = new HostType();
    Registration.instance(INode, host).register(childContainer);
    const vmFactory = childContainer.getFactory(comp);
    const vm = vmFactory!.construct(childContainer);

    const controller = Controller.forCustomElement(
      vm,
      parentContainer.get(ILifecycle),
      host,
      parentContainer,
      undefined,
      LifecycleFlags.none
    );

    appendManyChildViews(controller.host, controller.nodes.childNodes);

    // debugger;
    // if (host instanceof Frame) {
    //   host.page.on('navigatedTo')
    // }
    host.on('loaded', (e) => {
      controller.bind(LifecycleFlags.none);
    });
    host.on('unloaded', (e) => {
      controller.unbind(LifecycleFlags.none);
    });

    return host;
  }

  public composeFactory<T extends NsView = NsView>(): () => T {

    return () => null!;
  }
}
