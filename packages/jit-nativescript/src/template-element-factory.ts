/* eslint-disable eqeqeq */
import { DI, IContainer, InterfaceSymbol, IResolver, Registration, inject } from '@aurelia/kernel';
import { IDOM, INode } from '@aurelia/runtime';
import { NsNode, INsXmlParser } from '@aurelia/runtime-nativescript';

/**
 * Utility that creates a `NsNode` out of string markup or an existing DOM node.
 *
 * It is idempotent in the sense that passing in an existing template element will simply return that template element,
 * so it is always safe to pass in a node without causing unnecessary DOM parsing or template creation.
 */
export interface ITemplateElementFactory<TNode extends INode = INode> {
  /**
   * Create a `NsNode` from a provided XML string.
   *
   * @param markup - A raw XML string that may or may not be wrapped in `<template></template>`
   */
  createTemplate(markup: string): TNode;
  /**
   * Create a `NsNode` from a provided DOM node. If the node is already a template, it
   * will be returned as-is (and removed from the DOM).
   *
   * @param node - A DOM node that may or may not be wrapped in `<template></template>`
   */
  createTemplate(node: TNode): TNode;
  /**
   * Create a `NsNode` from a provided DOM node or XML string.
   *
   * @param input - A DOM node or raw XML string that may or may not be wrapped in `<template></template>`
   */
  createTemplate(input: unknown): TNode;
  createTemplate(input: unknown): TNode;
}

// For some reason rollup complains about `DI.createInterface<ITemplateElementFactory>().noDefault()` with this message:
// "semantic error TS2742 The inferred type of 'ITemplateElementFactory' cannot be named without a reference to '@aurelia/jit/node_modules/@aurelia/kernel'. This is likely not portable. A type annotation is necessary"
// So.. investigate why that happens (or rather, why it *only* happens here and not for the other 50)
export const ITemplateElementFactory: InterfaceSymbol<ITemplateElementFactory> = DI.createInterface<ITemplateElementFactory>('ITemplateElementFactory').noDefault();

const markupCache: Record<string, NsNode | undefined> = {};

/**
 * Default implementation for `ITemplateFactory` for use in an XML based runtime.
 *
 * @internal
 */
@inject(IDOM, INsXmlParser)
export class NsTemplateElementFactory implements ITemplateElementFactory {
  private template: NsNode;

  public constructor(
    private readonly dom: IDOM,
    private readonly parser: INsXmlParser
  ) {
    this.template = dom.createTemplate() as NsNode;
  }

  public static register(container: IContainer): IResolver<ITemplateElementFactory> {
    return Registration.singleton(ITemplateElementFactory, this).register(container);
  }

  public createTemplate(markup: string): NsNode;
  public createTemplate(node: NsNode): NsNode;
  public createTemplate(input: unknown): NsNode;
  public createTemplate(input: string | NsNode): NsNode {
    if (typeof input === 'string') {
      let result = markupCache[input];
      if (result === void 0) {
        const template = this.template;
        this.parser.parseInto(template, input);
        const node = template.firstChild;
        // if the input is either not wrapped in a template or there is more than one node,
        // return the whole template that wraps it/them (and create a new one for the next input)
        if (node == null || node.nodeName !== 'Template' || node.nextSibling != null) {
          this.template = new NsNode('Template');
          result = template;
        } else {
          // the node to return is both a template and the only node, so return just the node
          // and clean up the template for the next input
          template.removeChild(node);
          result = node;
        }

        markupCache[input] = result;
      }

      return result.cloneNode(true);
    }
    if (input.nodeName !== 'Template') {
      // if we get one node that is not a template, wrap it in one
      const template = this.dom.createTemplate() as NsNode;
      template.appendChild(input);
      return template;
    }
    // we got a template element, remove it from the DOM if it's present there and don't
    // do any other processing
    if (input.parentNode != null) {
      input.parentNode.removeChild(input);
    }
    return input;
  }
}
