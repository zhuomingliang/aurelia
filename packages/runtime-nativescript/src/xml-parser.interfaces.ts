import { XmlParser, ParserEventType } from '@nativescript/core';
import { DI } from '@aurelia/kernel';
import { NsNode } from './dom';

export interface INsXmlParser {
  parse(xml: string): NsNode;
  parseInto<TNode extends NsNode = NsNode>(node: TNode, xml: string): TNode;
}
export const INsXmlParser = DI.createInterface<INsXmlParser>('INsXmlParser').noDefault();
