import {
  IContainer,
  IResolver,
  Registration,
  Metadata
} from '@aurelia/kernel';
import {
  CustomElementHost,
  IDOM,
  IElementProjector,
  INodeSequence,
  IProjectorLocator,
  CustomElementDefinition,
  CustomElement,
  ICustomElementController,
} from '@aurelia/runtime';
import { NsView } from '../dom';

export class NsProjectorLocator implements IProjectorLocator<NsView> {
  public static register(container: IContainer): IResolver<IProjectorLocator<NsView>> {
    return Registration.singleton(IProjectorLocator, this).register(container);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public getElementProjector(dom: IDOM<any>, $component: ICustomElementController<NsView>, host: CustomElementHost<NsView>, def: CustomElementDefinition): IElementProjector<NsView> {

    return new NsHostProjector($component, host);
  }
}

/** @internal */
export class NsHostProjector implements IElementProjector<NsView> {
  public constructor(
    $controller: ICustomElementController<NsView>,
    public host: CustomElementHost<NsView>,
  ) {
    Metadata.define(CustomElement.name, $controller, host);
  }

  public get children(): ArrayLike<CustomElementHost<NsView>> {
    throw new Error('Not implemented: HostProjector:get children()');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public subscribeToChildrenChange(callback: () => void): void {
    // Do nothing since this scenario will never have children.
  }

  public provideEncapsulationSource(): NsView {
    throw new Error('Not implemented: provideEncapsulationSource');
  }

  public project(nodes: INodeSequence<NsView>): void {
    nodes.appendTo(this.host);
  }

  public take(nodes: INodeSequence<NsView>): void {
    nodes.remove();
    // nodes.unlink();
  }
}
