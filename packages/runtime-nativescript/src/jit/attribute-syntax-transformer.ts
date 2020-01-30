import { AttrSyntax } from '@aurelia/jit';
import { DI } from '@aurelia/kernel';
import { NsNode } from '../runtime/dom';

export interface IAttrSyntaxTransformer {
  transform(node: NsNode, attrSyntax: AttrSyntax): void;
  map(tagName: string, attr: string): string;
}

export const IAttrSyntaxTransformer =
  DI
    .createInterface<IAttrSyntaxTransformer>('IAttrSyntaxTransformer')
    .noDefault();
