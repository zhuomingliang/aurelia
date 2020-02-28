/* eslint-disable eqeqeq */
import {
  IContainer,
  IResolver,
  Registration,
  IIndexable,
} from '@aurelia/kernel';
import {
  DOM,
  IDOM,
  INode,
  INodeSequence,
  IRenderLocation,
  CustomElement,
} from '@aurelia/runtime';
import { View, LayoutBase, Page, ContentView } from '@nativescript/core';
import { INsXmlParser } from './xml-parser.interfaces';
import { NsViewRegistry } from './element-registry';
import { NsEventHandler } from './observation/event-manager';
import { appendManyChildViews, appendChildView, replaceView, insertBefore, insertManyViewsBefore } from './ns-view-utils';

// reexport for better hint from naming
export type NsView = View & INode;

export const enum SpecialNodeName {
  Comment = '#Comment',
  Text = '#Text',
  Marker = '#Marker',
  RenderLocation = '#RenderLocation',
  // only because this is used a lot
  Template = 'Template',
}

const effectiveParentNodeOverrides = new WeakMap<NsNode, NsNode>();

export class NsDOM implements IDOM<NsNode> {

  public static register(container: IContainer): IResolver<IDOM<NsNode>> {
    return Registration.singleton(IDOM, this).register(container);
  }

  public constructor(
    @INsXmlParser private readonly parser: INsXmlParser
  ) {
    DOM.initialize(this as unknown as IDOM<INode>);
  }

  public createNodeSequence(fragment: NsNode): INodeSequence<any> {
    if (fragment === null) {
      return new NsNodeSequence([]);
    }
    return new NsNodeSequence(fragment.children);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public addEventListener(eventName: string, subscriber: unknown, publisher?: unknown, options?: unknown): void {
    if (publisher instanceof View) {
      publisher.on(eventName, subscriber as NsEventHandler);
      return;
    }
    console.error('Not implemented: addEventListener', { eventName, subscriber, publisher, options });
    throw new Error('Not implemented: addEventListener');
  }

  public appendChild(parent: NsNode, child: NsNode): void {
    parent.appendChild(child);
  }

  public cloneNode<T extends NsNode = NsNode>(node: T, deep?: boolean): T {
    return node.cloneNode(deep) as T;
  }

  public convertToRenderLocation(node: NsNode): IRenderLocation<NsNode> & NsNode {
    if (this.isRenderLocation(node)) {
      return node; // it's already a IRenderLocation (converted by FragmentNodeSequence)
    }

    if (node.parentNode == null) {
      throw new Error('Cannot convert to render location. Not attached to any parent node');
    }

    // it's actually not NsNode here
    // as by this time, the NsNode

    const commentNode = node as unknown as NsView;
    // const locationEnd = NsNode.comment('au-end');
    // const locationStart = NsNode.comment('au-start');
    // node.parentNode.replaceChild(locationEnd, node);
    
    const locationEnd = new ContentView();
    const locationStart = new ContentView();

    (locationEnd as unknown as IIndexable).$start = locationStart;
    (locationStart as unknown as IIndexable).$nodes = null;

    replaceView(locationEnd, commentNode);
    insertBefore(locationStart, locationEnd);


    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    // locationEnd.parentNode!.insertBefore(locationStart, locationEnd);

    // (locationEnd as IRenderLocation).$start = locationStart as IRenderLocation;
    // (locationStart as IRenderLocation).$nodes = null!;

    // return locationEnd as IRenderLocation<NsNode> & NsNode;
    return locationEnd as unknown as IRenderLocation<NsNode> & NsNode;
  }

  public createDocumentFragment(nodeOrText?: NsNode | string): NsNode {
    if (nodeOrText instanceof NsNode) {
      return nodeOrText;
    }
    if (nodeOrText === void 0) {
      return NsNode.template();
    }
    return this.parser.parseInto(NsNode.template(), nodeOrText);
  }

  public createElement(name: string): NsNode {
    return new NsNode(name);
  }

  public createTemplate(nodeOrText?: NsNode | string): NsNode {
    const templateNode = NsNode.template();
    if (typeof nodeOrText === 'string') {
      return this.parser.parseInto(templateNode, nodeOrText ?? '');
    }
    if (nodeOrText != null) {
      templateNode.appendChild(nodeOrText);
    }
    return templateNode;
  }

  public createTextNode(text: string): NsNode {
    const textNode = new NsNode(SpecialNodeName.Text);
    textNode.text = text;
    return textNode;
  }

  /**
   * Returns the effective parentNode according to Aurelia's component hierarchy.
   *
   * Used by Aurelia to find the closest parent controller relative to a node.
   *
   * This method supports 3 additional scenarios that `node.parentNode` does not support:
   * - Containerless elements. The parentNode in this case is a comment precending the element under specific conditions, rather than a node wrapping the element.
   * - ShadowDOM. If a `ShadowRoot` is encountered, this method retrieves the associated controller via the metadata api to locate the original host.
   * - Portals. If the provided node was moved to a different location in the DOM by a `portal` attribute, then the original parent of the node will be returned.
   *
   * @param node - The node to get the parent for.
   * @returns Either the closest parent node, the closest `IRenderLocation` (comment node that is the containerless host), original portal host, or `null` if this is either the absolute document root or a disconnected node.
   */
  public getEffectiveParentNode(node: NsNode): NsNode | null {
    // TODO: this method needs more tests!
    // First look for any overrides
    if (effectiveParentNodeOverrides.has(node)) {
      return effectiveParentNodeOverrides.get(node)!;
    }

    // Then try to get the nearest au-start render location, which would be the containerless parent,
    // again looking for any overrides along the way.
    // otherwise return the normal parent node
    let containerlessOffset = 0;
    let next = node.nextSibling;
    while (next !== null) {
      if (next.nodeType === NodeType.Comment) {
        switch (next.text) {
          case 'au-start':
            // If we see an au-start before we see au-end, it will precede the host of a sibling containerless element rather than a parent.
            // So we use the offset to ignore the next au-end
            ++containerlessOffset;
            break;
          case 'au-end':
            if (containerlessOffset-- === 0) {
              return next;
            }
        }
      }
      next = next.nextSibling;
    }

    if (node.parentNode === null && node.nodeType === NodeType.DocumentFragment) {
      // Could be a shadow root; see if there's a controller and if so, get the original host via the projector
      const controller = CustomElement.for(node);
      if (controller === void 0) {
        // Not a shadow root (or at least, not one created by Aurelia)
        // Nothing more we can try, just return null
        return null;
      }
    }

    return node.parentNode;
  }

  /**
   * Set the effective parentNode, overriding the DOM-based structure that `getEffectiveParentNode` otherwise defaults to.
   *
   * Used by Aurelia's `portal` template controller to retain the linkage between the portaled nodes (after they are moved to the portal target) and the original `portal` host.
   *
   * @param nodeSequence - The node sequence whose children that, when `getEffectiveParentNode` is called on, return the supplied `parentNode`.
   * @param parentNode - The node to return when `getEffectiveParentNode` is called on any child of the supplied `nodeSequence`.
   */
  public setEffectiveParentNode(nodeSequence: INodeSequence, parentNode: NsNode): void;
  /**
   * Set the effective parentNode, overriding the DOM-based structure that `getEffectiveParentNode` otherwise defaults to.
   *
   * Used by Aurelia's `portal` template controller to retain the linkage between the portaled nodes (after they are moved to the portal target) and the original `portal` host.
   *
   * @param childNode - The node that, when `getEffectiveParentNode` is called on, returns the supplied `parentNode`.
   * @param parentNode - The node to return when `getEffectiveParentNode` is called on the supplied `childNode`.
   */
  public setEffectiveParentNode(childNode: NsNode, parentNode: NsNode): void;
  public setEffectiveParentNode(childNodeOrNodeSequence: NsNode | INodeSequence, parentNode: NsNode): void {
    if (this.isNodeInstance(childNodeOrNodeSequence)) {
      effectiveParentNodeOverrides.set(childNodeOrNodeSequence, parentNode);
    } else {
      const nodes = childNodeOrNodeSequence.childNodes;
      for (let i = 0, ii = nodes.length; i < ii; ++i) {
        effectiveParentNodeOverrides.set(nodes[i] as NsNode, parentNode);
      }
    }
  }

  public insertBefore(nodeToInsert: NsNode, referenceNode: NsNode): void {
    referenceNode.parentNode?.insertBefore(nodeToInsert, referenceNode);
  }

  public isMarker(node: NsNode): node is NsNode {
    return node.nodeName === SpecialNodeName.Marker;
  }

  public isNodeInstance(node: unknown): node is NsNode {
    return node instanceof NsNode;
  }

  public isRenderLocation(node: unknown): node is IRenderLocation<NsNode> & NsNode {
    return node instanceof NsNode && node.nodeName === SpecialNodeName.RenderLocation;
  }

  public makeTarget(node: NsNode): void {
    node.isTarget = true;
  }

  public registerElementResolver(container: IContainer, resolver: IResolver): void {
    container.registerResolver(INode, resolver);
    // container.registerResolver(NsNode, resolver);
    container.registerResolver(View, resolver);
  }

  public remove(node: NsNode): void {
    node.remove();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public removeEventListener(eventName: string, subscriber: unknown, publisher?: unknown, options?: unknown): void {
    if (publisher instanceof View) {
      publisher.off(eventName, subscriber as NsEventHandler);
    }
  }

  public setAttribute(node: NsNode, name: string, value: unknown): void {
    node.setAttribute(name, String(value));
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public createCustomEvent(eventType: string, options?: unknown): unknown {
    console.error('Not implemented: NsDOM: createCustomEvent');
    return {};
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public dispatchEvent(evt: unknown): void {
    console.error('Not implemented: NsDOM: dispatchEvent');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public createNodeObserver(node: NsNode, cb: (...args: unknown[]) => void, init: unknown): unknown {
    throw new Error('Not implemented: createNodeObserver');
  }
}

// Might not need something NS-specific here. Probably should just copy paste the FragmentNodeSequence for starters?
// See: packages\runtime-html\src\dom.ts (near the bottom)

export class NsNodeSequence implements INodeSequence<NsView> {
  public isMounted: boolean = false;
  public isLinked: boolean = false;

  public firstChild: NsView = (void 0)!;
  public lastChild: NsView = (void 0)!;

  public next?: NsNodeSequence = void 0;
  public childNodes: NsView[];

  private readonly nsNodes: NsNode[];

  public constructor(
    nsNodes: NsNode[],
  ) {
    const cloneIsTarget = (newNode: NsNode, originalNode: NsNode) => {
      newNode.isTarget = originalNode.isTarget;
    }
    nsNodes = nsNodes.map(nsNode => nsNode.cloneNode(true, cloneIsTarget));
    let childNodes: NsView[] = nsNodes.map(nsNode => {
      return nsNode.render(true);
    });
    this.nsNodes = nsNodes;
    this.childNodes = childNodes;
  }

  public findTargets(): NsView[] {
    let targets: NsView[] = [];
    this.nsNodes.forEach(nsNode => {
      targets = targets.concat(nsNode.targets.map(t => t.view!));
    });
    return targets;
  }

  public insertBefore(refNode: NsView): void {
    insertManyViewsBefore(this.childNodes, refNode);
  }

  public appendTo(parent: NsView): void {
    appendManyChildViews(parent, this.childNodes);
  }

  public remove(): void {
    for (const child of this.childNodes) {
      child.parentNode._removeView(child);
    }
  }

  public addToLinked(): void {
    console.warn('Not implemented: NsNodeSequence: addToLinked');
  }

  public unlink(): void {
    console.info('Not implemented: NsNodeSequence: unlink');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public link(next: NsNodeSequence | IRenderLocation<NsNode> | undefined): void {
    console.warn('Not implemented: NsNodeSequence.link');
  }
}

export const enum NodeType {
  Element = 1,
  Attr = 2,
  Text = 3,
  CDATASection = 4,
  EntityReference = 5,
  Entity = 6,
  ProcessingInstruction = 7,
  Comment = 8,
  Document = 9,
  DocumentType = 10,
  DocumentFragment = 11,
  Notation = 12,
}

// eslint-disable-next-line sonarjs/no-unused-collection
const nsView2NsNodeMap: WeakMap<NsView, NsNode> = new WeakMap();

/**
 * A class representing partially parsed node of a NS XML template.
 *
 * For the first iteration, this will be used as both pre-compiled and post-compiled node target
 */
export class NsNode implements INode {

  /**
   * A helper to shortcut the creation of a comment NsNode with some given text
   */
  public static comment(text: string): NsNode {
    const commentNode = new NsNode(SpecialNodeName.Comment);
    commentNode.text = text;
    return commentNode;
  }

  /**
   * A helper to shortcut the creation of a text NsNode with some given text
   */
  public static text(text: string): NsNode {
    const textNode = new NsNode(SpecialNodeName.Text);
    textNode.text = text;
    return textNode;
  }

  /**
   * A helper to shortcut the creation of a NsNode with the name "Template"
   */
  public static template(): NsNode {
    return new NsNode(SpecialNodeName.Template);
  }

  public view?: NsView;

  // everything is an element unless not
  public nodeType: NodeType = 1;
  public isTarget: boolean = false;
  public readonly children: NsNode[] = [];
  public text: string = '';
  /**
   * The reference to the attributes of this node in the XML template
   */
  public attributes: Record<string, string> | undefined = void 0;

  public get attrs(): { name: string; value: string }[] {
    const attrs = this.attributes;
    if (attrs === void 0) {
      return [];
    }
    return Object.keys(attrs).map(attr => ({ name: attr, value: attrs[attr] }));
  }

  public get targets(): NsNode[] {
    const targets: NsNode[] = this.isTarget ? [this] : [];
    targets.push(...this.children.flatMap(x => x.targets));
    return targets;
  }

  private _parent: NsNode | null = null;
  public get parentNode(): NsNode | null {
    return this._parent;
  }

  public get firstChild(): NsNode | null {
    const allChildren = this.children;
    if (allChildren.length > 0) {
      return allChildren[0];
    }
    return null;
  }

  public get lastChild(): NsNode | null {
    const allChildren = this.children;
    if (allChildren.length > 0) {
      return allChildren[allChildren.length - 1];
    }
    return null;
  }

  public get nextSibling(): NsNode | null {
    const parent = this._parent;
    if (parent === null) {
      return null;
    }
    const allParentChildren = parent.children;
    const index = allParentChildren.indexOf(this);
    // next-sibling-able
    if (index < allParentChildren.length - 1) {
      return allParentChildren[index + 1];
    }
    return null;
  }

  public get previousSibling(): NsNode | null {
    const parent = this._parent;
    if (parent === null) {
      return null;
    }
    const allParentChildren = parent.children;
    const index = allParentChildren.indexOf(this);
    // previous-sibling-able
    if (index > 0) {
      return allParentChildren[index - 1];
    }
    return null;
  }

  public get childNodes(): NsNode[] {
    return this.children;
  }

  // simulate HTML DOM
  public get tagName(): string {
    return this.nodeName.toUpperCase();
  }

  public get hasView(): boolean {
    return this.view !== void 0;
  }

  public constructor(
    public readonly nodeName: string
  ) {}

  public insertBefore(newNode: NsNode, child: NsNode): NsNode {
    // todo: throw if not child?
    if (newNode !== child) {
      const childNodes = this.childNodes;
      const index = childNodes.indexOf(newNode);
      const swapping = -1 < index;
      if (swapping) {
        childNodes.splice(index, 1);
      }
      if (child != null) {
        childNodes.splice(childNodes.indexOf(child), 0, newNode);
      } else {
        childNodes.push(newNode);
      }
      if (!swapping) {
        newNode.parentNode?.removeChild(newNode);
        newNode._parent = this;
      }
    }
    return newNode;
  }

  public appendChild(child: NsNode): NsNode {
    if (child == null) {
      throw new Error('Invalid child in appendChild');
    }
    child.parentNode?.removeChild(child);
    this.children.push(child);
    child._parent = this;
    return child;
  }

  public removeChild(child: NsNode): NsNode {
    const idx = this.children.indexOf(child);
    if (idx > -1) {
      this.children.splice(idx, 1);
      child._parent = null;
    }
    return child;
  }

  public replaceChild(newChild: NsNode, oldChild: NsNode): NsNode {
    if (newChild !== oldChild) {
      const allChildren = this.children;
      const idx = allChildren.indexOf(oldChild);
      newChild.parentNode?.removeChild(newChild);
      allChildren.splice(idx, idx > -1 ? 1 : 0, newChild);
      newChild._parent = this;
    }
    return oldChild;
  }

  public remove(): void {
    this.parentNode?.removeChild(this);
  }

  public cloneNode(deep?: boolean, eachNodeCallback?: (newNode: NsNode, originalNode: NsNode) => void): NsNode {
    const root = new NsNode(this.nodeName);
    root.attributes = this.attributes === void 0 ? void 0 : Object.assign(this.attributes);
    root.text = this.text;
    if (deep) {
      this.children.forEach(child => {
        root.appendChild(child.cloneNode(deep, eachNodeCallback));
      });
    }
    if (eachNodeCallback !== void 0) {
      eachNodeCallback(root, this);
    }
    return root;
  }

  public getAttribute(name: string): string | null {
    const attrs = this.attributes;
    if (attrs === void 0) {
      return null;
    }
    return attrs[name] ?? null;
  }

  public setAttribute(name: string, value: string): void {
    let attrs = this.attributes;
    if (attrs === void 0) {
      attrs = this.attributes = {};
    }
    attrs[name] = value;
  }

  public removeAttribute(name: string): void {
    const attrs = this.attributes;
    if (attrs !== void 0 && name in attrs) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete attrs[name];
    }
  }

  public getRootNode(): NsNode {
    if (this._parent === null) {
      return this;
    }
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let curr: NsNode | null = this;
    while (curr !== null) {
      curr = this._parent;
    }
    return curr;
  }

  public render(deep?: boolean): NsView {
    // idempotent
    if (this.view !== void 0) {
      return this.view;
    }
    const view = NsViewRegistry.create(this);
    this.view = view;
    nsView2NsNodeMap.set(view, this);
    if (deep) {
      this.childNodes.forEach(node => {
        appendChildView(view, node.render(deep));
      });
    }
    return view;
  }
}
