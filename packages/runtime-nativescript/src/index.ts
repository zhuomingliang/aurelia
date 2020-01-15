import {
  DI,
  IContainer,
  IResolver,
  Registration,
} from '@aurelia/kernel';
import {
  DebugConfiguration,
} from '@aurelia/debug';
import {
  CustomElementHost,
  IDOM,
  IElementProjector,
  ILifecycle,
  INode,
  INodeSequence,
  IProjectorLocator,
  IRenderLocation,
  CustomElementDefinition,
  CustomElement,
  ICustomElementController,
  ILifecycleRegistration,
  Controller,
  IRendererRegistration,
  ITemplateCompiler,
  PartialCustomElementDefinition,
  HydrateElementInstruction,
  CustomElementRendererRegistration,
  LifecycleFlags,
} from '@aurelia/runtime';
import { Page } from '@nativescript/core';

export class NSNode implements INode {
  public isTarget: boolean = false;
  public readonly children: NSNode[] = [];

  public get targets(): NSNode[] {
    const targets: NSNode[] = this.isTarget ? [this] : [];
    targets.push(...this.children.flatMap(x => x.targets));
    return targets;
  }

  public constructor(
    public parent?: NSNode,
  ) {}

  public appendChild(child: NSNode): void {
    this.children.push(child);
  }

  public removeChild(child: NSNode): void {
    const idx = this.children.indexOf(child);
    if (idx > -1) {
      this.children.splice(idx, 1);
    }
  }

  public remove(): void {
    this.parent?.removeChild(this);
  }
}

export class NSDOM implements IDOM<NSNode> {
  public createNodeSequence(fragment: NSNode): NSNodeSequence {
    if (fragment === null) {
      return new NSNodeSequence([]);
    }
    return new NSNodeSequence(fragment.children);
  }
  public addEventListener(eventName: string, subscriber: unknown, publisher?: unknown, options?: unknown): void {
    throw new Error('Not implemented');
  }
  public appendChild(parent: NSNode, child: NSNode): void {
    throw new Error('Not implemented');
  }
  public cloneNode<T extends INode = NSNode>(node: T, deep?: boolean): T {
    throw new Error('Not implemented');
  }
  public convertToRenderLocation(node: NSNode): IRenderLocation<NSNode> & NSNode {
    throw new Error('Not implemented');
  }
  public createDocumentFragment(nodeOrText?: NSNode | string): NSNode {
    if (nodeOrText instanceof NSNode) {
      return nodeOrText;
    }
    throw new Error('No XML parser in the runtime at the moment');
  }
  public createElement(name: string): NSNode {
    throw new Error('Not implemented');
  }
  public createTemplate(nodeOrText?: NSNode | string): NSNode {
    throw new Error('Not implemented');
  }
  public createTextNode(text: string): NSNode {
    throw new Error('Not implemented');
  }
  public getEffectiveParentNode(node: NSNode): NSNode | null {
    throw new Error('Not implemented');
  }
  public setEffectiveParentNode(child: NSNodeSequence, parent: NSNode): void;
  public setEffectiveParentNode(child: NSNode, parent: NSNode): void;
  public setEffectiveParentNode(child: NSNode | NSNodeSequence, parent: NSNode): void {
    throw new Error('Not implemented');
  }
  public insertBefore(nodeToInsert: NSNode, referenceNode: NSNode): void {
    throw new Error('Not implemented');
  }
  public isMarker(node: NSNode): node is NSNode {
    throw new Error('Not implemented');
  }
  public isNodeInstance(node: NSNode): node is NSNode {
    throw new Error('Not implemented');
  }
  public isRenderLocation(node: unknown): node is IRenderLocation<NSNode> & NSNode {
    throw new Error('Not implemented');
  }
  public makeTarget(node: NSNode): void {
    throw new Error('Not implemented');
  }
  public registerElementResolver(container: IContainer, resolver: IResolver): void {
    container.registerResolver(INode, resolver);
    container.registerResolver(NSNode, resolver);
  }
  public remove(node: NSNode): void {
    throw new Error('Not implemented');
  }
  public removeEventListener(eventName: string, subscriber: unknown, publisher?: unknown, options?: unknown): void {
    throw new Error('Not implemented');
  }
  public setAttribute(node: NSNode, name: string, value: unknown): void {
    throw new Error('Not implemented');
  }
  public createCustomEvent(eventType: string, options?: unknown): unknown {
    throw new Error('Not implemented');
  }
  public dispatchEvent(evt: unknown): void {
    throw new Error('Not implemented');
  }
  public createNodeObserver?(node: NSNode, cb: (...args: unknown[]) => void, init: unknown): unknown {
    throw new Error('Not implemented');
  }
}

export class NSProjectorLocator implements IProjectorLocator {
  public getElementProjector(dom: IDOM, $component: ICustomElementController<NSNode>, host: CustomElementHost<NSNode>, def: CustomElementDefinition): IElementProjector {
    return new NSProjector(host);
  }
}

export class NSProjector implements IElementProjector {
  public constructor(
    public host: CustomElementHost<NSNode>,
  ) {}

  public get children(): NSNode[] {
    throw new Error('Not implemented');
  }

  public subscribeToChildrenChange(callback: () => void): void {
    throw new Error('Not implemented');
  }

  public provideEncapsulationSource(): NSNode {
    throw new Error('Not implemented');
  }

  public project(nodes: NSNodeSequence): void {
    nodes.appendTo(this.host);
  }

  public take(nodes: NSNodeSequence): void {
    nodes.remove();
  }
}

export class NSNodeSequence implements INodeSequence<NSNode> {
  public isMounted: boolean = false;
  public isLinked: boolean = false;

  public firstChild: NSNode = (void 0)!;
  public lastChild: NSNode = (void 0)!;

  public next?: NSNodeSequence = void 0;

  public constructor(
    public childNodes: NSNode[],
  ) {}

  public findTargets(): NSNode[] {
    return this.childNodes.flatMap(x => x.targets);
  }

  public insertBefore(refNode: NSNode): void {
    throw new Error('Not implemented');
  }

  public appendTo(parent: NSNode): void {
    for (const child of this.childNodes) {
      parent.appendChild(child);
    }
  }

  public remove(): void {
    for (const child of this.childNodes) {
      child.remove();
    }
  }

  public addToLinked(): void {
    throw new Error('Not implemented');
  }

  public unlink(): void {
    throw new Error('Not implemented');
  }

  public link(next: NSNodeSequence | IRenderLocation<NSNode> | undefined): void {
    throw new Error('Not implemented');
  }
}

export class NSTemplateCompiler implements ITemplateCompiler {
  public compile(partialDefinition: PartialCustomElementDefinition, context: IContainer): CustomElementDefinition {
    const definition = CustomElementDefinition.getOrCreate(partialDefinition);
    if (definition.template === null) {
      return definition;
    }

    if (definition.template === '<Page></Page>') {
      const template = new NSNode();
      const page = new NSNode();
      page.isTarget = true;
      template.appendChild(page);
      return CustomElementDefinition.create({
        ...definition,
        template,
        instructions: [
          [
            new HydrateElementInstruction('ns-page', []),
          ]
        ],
        needsCompile: false,
      });
    }
    throw new Error(`Need an XML parser here etc: ${definition.template}`);
  }
}

class NSPage {
  private readonly $page!: Page;

  public constructor() {
    // this.$page = new Page();
    console.log('NSPage.constructor called');
  }

  public beforeBind(): void {
    console.log('NSPage.beforeBind called');
  }

  public afterBind(): void {
    console.log('NSPage.afterBind called');
  }

  public beforeAttach(): void {
    console.log('NSPage.beforeAttach called');
  }

  public afterAttach(): void {
    console.log('NSPage.afterAttach called');
  }
}

CustomElement.define({ name: 'ns-page', template: null }, NSPage);

class App {

}
CustomElement.define({ name: 'app', template: '<Page></Page>' }, App);

const container = DI.createContainer();
container.register(
  DebugConfiguration,

  ILifecycleRegistration,
  IRendererRegistration,
  CustomElementRendererRegistration, // The renderer for HydrateElementInstruction
  Registration.singleton(IDOM, NSDOM),
  Registration.singleton(ITemplateCompiler, NSTemplateCompiler),
  Registration.singleton(IProjectorLocator, NSProjectorLocator),
  App,
  NSPage,
);

const lifecycle = container.get(ILifecycle);
const viewModel = container.get<typeof App>(CustomElement.keyFrom('app'));

const host = new NSNode();

const controller = Controller.forCustomElement(
  viewModel,
  lifecycle,
  host,
  container,
  void 0,
);

controller.bind(LifecycleFlags.fromStartTask | LifecycleFlags.fromBind);
controller.attach(LifecycleFlags.fromStartTask | LifecycleFlags.fromAttach);
