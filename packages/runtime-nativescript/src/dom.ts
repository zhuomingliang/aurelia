import {
  IContainer,
  IResolver,
  Registration,
} from '@aurelia/kernel';
import {
  DOM,
  IDOM,
  INode,
  INodeSequence,
  IRenderLocation,
} from '@aurelia/runtime';

export class NSDOM implements IDOM {
  public static register(container: IContainer): IResolver<IDOM> {
    return Registration.alias(IDOM, this).register(container);
  }

  public addEventListener(eventName: string, subscriber: unknown, publisher?: unknown, options?: unknown): void {
    throw new Error('Method not implemented.');
  }
  public appendChild(parent: INode, child: INode): void {
    throw new Error('Method not implemented.');
  }
  public cloneNode<TClone extends INode>(node: TClone, deep?: boolean | undefined): TClone {
    throw new Error('Method not implemented.');
  }
  public convertToRenderLocation(node: INode): IRenderLocation {
    throw new Error('Method not implemented.');
  }
  public createDocumentFragment(markupOrNode?: string | INode | undefined): INode {
    throw new Error('Method not implemented.');
  }
  public createNodeSequence(fragment: INode | null): INodeSequence {
    throw new Error('Method not implemented.');
  }
  public createElement(name: string): INode {
    throw new Error('Method not implemented.');
  }
  public createCustomEvent(eventType: string, options?: unknown): unknown {
    throw new Error('Method not implemented.');
  }
  public dispatchEvent(evt: unknown): void {
    throw new Error('Method not implemented.');
  }
  public createTemplate(markup?: string | undefined): INode {
    throw new Error('Method not implemented.');
  }
  public createTextNode(text: string): INode {
    throw new Error('Method not implemented.');
  }
  public getEffectiveParentNode(node: INode): INode | null {
    throw new Error('Method not implemented.');
  }
  public setEffectiveParentNode(nodeSequence: INodeSequence, parentNode: INode): void;
  public setEffectiveParentNode(childNode: INode, parentNode: INode): void;
  public setEffectiveParentNode(childNode: any, parentNode: any) {
    throw new Error('Method not implemented.');
  }
  public insertBefore(nodeToInsert: INode, referenceNode: INode): void {
    throw new Error('Method not implemented.');
  }
  public isMarker(node: unknown): node is INode {
    throw new Error('Method not implemented.');
  }
  public isNodeInstance(potentialNode: unknown): potentialNode is INode {
    throw new Error('Method not implemented.');
  }
  public isRenderLocation(node: unknown): node is IRenderLocation {
    throw new Error('Method not implemented.');
  }
  public makeTarget(node: INode): void {
    throw new Error('Method not implemented.');
  }
  public registerElementResolver(container: IContainer, resolver: IResolver): void {
    throw new Error('Method not implemented.');
  }
  public remove(node: INode): void {
    throw new Error('Method not implemented.');
  }
  public removeEventListener(eventName: string, subscriber: unknown, publisher?: unknown, options?: unknown): void {
    throw new Error('Method not implemented.');
  }
  public setAttribute(node: INode, name: string, value: unknown): void {
    throw new Error('Method not implemented.');
  }
}

const $DOM = DOM as unknown as NSDOM;
export { $DOM as DOM };

// Might not need something NS-specific here. Probably should just copy paste the FragmentNodeSequence for starters?
// See: packages\runtime-html\src\dom.ts (near the bottom)

export class NSNodeSequence /* implements INodeSequence */ {

}

