import { DI, InterfaceSymbol } from '@aurelia/kernel';
import { INode } from '@aurelia/runtime';

// See packages\jit-html\src\template-element-factory.ts
// This is where you would hook up whatever parser is needed to parse the NS templates (xml?)

// No need for all the fancy caching stuff in jit-html, it could probably be a one-liner implementation just to get it working

export interface ITemplateElementFactory<TNode extends INode = INode> {
  createTemplate(input: unknown): TNode;
}

export const ITemplateElementFactory: InterfaceSymbol<ITemplateElementFactory> = DI.createInterface<ITemplateElementFactory>('ITemplateElementFactory').noDefault();
