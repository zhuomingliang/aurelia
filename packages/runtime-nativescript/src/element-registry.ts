/* eslint-disable eqeqeq, @typescript-eslint/no-unused-vars */
import { NsView, NsNode } from './dom';
import { Label, Page, Button, TextField, ListView, StackLayout, TabView, Progress } from '@nativescript/core';

export type NsViewCreator = (node: NsNode | null) => NsView;

export const NsViewRegistry = new class {
  public readonly $registry: Map<string, NsViewCreator> = new Map<string, NsViewCreator>();

  public register(name: string, handler: NsViewCreator): this {
    if (this.$registry.has(name)) {
      throw new Error(`Invalid registration. "${name}" creation handler is already registered.`);
    }
    this.$registry.set(name, handler);
    return this;
  }

  public create(nameOrNode: string | NsNode): NsView {
    const name = typeof nameOrNode === 'string' ? nameOrNode : nameOrNode.nodeName;
    const handler = this.$registry.get(name);
    if (handler == null) {
      throw new Error(`Trying to create unknown element with name: ${String(name)}`);
    }
    return handler(typeof nameOrNode === 'string' ? null : nameOrNode);
  }
}();

NsViewRegistry
  .register('Label', nsNode => {
    return new Label();
  })
  .register('Page', nsNode => {
    return new Page();
  })
  .register('Progress', nsNode => {
    return new Progress();
  })
  .register('Button', nsNode => {
    return new Button();
  })
  .register('TextField', nsNode => {
    return new TextField();
  })
  .register('StackLayout', nsNode => {
    return new StackLayout();
  })
  .register('TabView', nsNode => {
    return new TabView();
  })
  .register('ListView', nsNode => {
    return new ListView();
  })
  .register('MyListView', nsNode => {
    return new ListView();
  });
