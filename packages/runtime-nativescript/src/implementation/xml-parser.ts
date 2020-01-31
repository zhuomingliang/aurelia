import { XmlParser, ParserEventType } from '@nativescript/core';
import { DI, IContainer, Registration } from '@aurelia/kernel';
import { NsNode } from '../dom';
import { INsXmlParser } from '../xml-parser.interfaces';

export class NsXmlParser {

  public static register(container: IContainer): void {
    Registration.singleton(INsXmlParser, this).register(container);
  }

  public parse(xml: string): NsNode {
    return this.parseInto(NsNode.template(), xml);
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
