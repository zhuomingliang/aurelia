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
// import { IShadowDOMStyles, IShadowDOMGlobalStyles } from './styles/shadow-dom-styles';
import { NsNode } from './dom';

// const defaultShadowOptions = {
//   mode: 'open' as 'open' | 'closed'
// };

export class NsProjectorLocator implements IProjectorLocator<NsNode> {
  public static register(container: IContainer): IResolver<IProjectorLocator<NsNode>> {
    return Registration.singleton(IProjectorLocator, this).register(container);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public getElementProjector(dom: IDOM<NsNode>, $component: ICustomElementController<NsNode>, host: CustomElementHost<NsNode>, def: CustomElementDefinition): IElementProjector<NsNode> {
    // if (def.shadowOptions || def.hasSlots) {
    //   if (def.containerless) {
    //     throw Reporter.error(21);
    //   }

    //   return new ShadowDOMProjector(dom, $component, host, def);
    // }

    // if (def.containerless) {
    //   return new ContainerlessProjector(dom, $component, host);
    // }

    return new HostProjector($component, host);
  }
}

// const childObserverOptions = { childList: true };

/** @internal */
export class HostProjector implements IElementProjector<NsNode> {
  public constructor(
    $controller: ICustomElementController<NsNode>,
    public host: CustomElementHost<NsNode>,
  ) {
    Metadata.define(CustomElement.name, $controller, host);
  }

  public get children(): ArrayLike<CustomElementHost<NsNode>> {
    return this.host.childNodes;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public subscribeToChildrenChange(callback: () => void): void {
    // Do nothing since this scenario will never have children.
  }

  public provideEncapsulationSource(): NsNode {
    return this.host.getRootNode();
  }

  public project(nodes: INodeSequence<NsNode>): void {
    nodes.appendTo(this.host);
  }

  public take(nodes: INodeSequence<NsNode>): void {
    nodes.remove();
    nodes.unlink();
  }
}

// /** @internal */
// export class ContainerlessProjector implements IElementProjector<NsNode> {
//   public host: CustomElementHost<NsNode>;

//   private readonly childNodes: readonly CustomElementHost<NsNode>[];

//   public constructor(
//     dom: IDOM<NsNode>,
//     $controller: ICustomElementController<NsNode>,
//     host: Node,
//   ) {
//     if (host.childNodes.length) {
//       this.childNodes = toArray(host.childNodes);
//     } else {
//       this.childNodes = PLATFORM.emptyArray;
//     }

//     this.host = dom.convertToRenderLocation(host) as CustomElementHost<NsNode>;
//     Metadata.define(CustomElement.name, $controller, this.host);
//   }

//   public get children(): ArrayLike<CustomElementHost<NsNode>> {
//     return this.childNodes;
//   }

//   public subscribeToChildrenChange(callback: () => void): void {
//     // TODO: turn this into an error
//     // Containerless does not have a container node to observe children on.
//   }

//   public provideEncapsulationSource(): Node {
//     return this.host.getRootNode();
//   }

//   public project(nodes: INodeSequence<NsNode>): void {
//     nodes.insertBefore(this.host);
//   }

//   public take(nodes: INodeSequence<NsNode>): void {
//     nodes.remove();
//     nodes.unlink();
//   }
// }
