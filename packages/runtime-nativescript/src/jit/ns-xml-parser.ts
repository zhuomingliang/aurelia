import { XmlParser, ParserEventType } from '@nativescript/core';
import { NsNode } from '../runtime/dom';
import { DI } from '@aurelia/kernel';

export interface INsXmlParser {
  parse(xml: string): NsNode;
  parseInto<TNode extends NsNode = NsNode>(node: TNode, xml: string): TNode;
}
export const INsXmlParser = DI.createInterface<INsXmlParser>('INsXmlParser').withDefault(x => x.singleton(NsXmlParser));

export class NsXmlParser {

  public parse(xml: string): NsNode {
    const rootNode = NsNode.template();

    this.parseInto(rootNode, xml);

    return rootNode;
  }

  public parseInto(node: NsNode, xml: string): NsNode {
    const originalNode = node;
    // let node: NSNode | null = null;
    new XmlParser(event => {
      switch (event.eventType) {
        case ParserEventType.StartElement: {
          const viewVNode = new NsNode(event.elementName!);
          viewVNode.attributes = { ...event.attributes as Record<string, string> };

          node.appendChild(viewVNode);
          node = viewVNode;
          break;
        }
        case ParserEventType.EndElement: {
          if (node.nodeName === event.elementName) {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
            node = node.parentNode!;
          }
          break;
        }
      }
    }).parse(xml);

    return originalNode;
  }
}
