/* eslint-disable eqeqeq, @typescript-eslint/no-unused-vars */
import { NsView, NsNode } from './dom';
import {
  Template,
  Label,
  Page,
  Button,
  TextField,
  ListView,
  StackLayout,
  TabView,
  Progress,
  Frame,
  TabViewItem,
  Tabs,
  TabStrip,
  TabStripItem,
  TabContentItem,
  GridLayout,
  AbsoluteLayout
} from '@nativescript/core';


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
  
  .register('StackLayout', nsNode => new StackLayout())
  .register('GridLayout', nsNode => new GridLayout())
  .register('AbsoluteLayout', nsNode => new AbsoluteLayout())

  .register('ListView', nsNode => {
    return new ListView();
  })
  .register('Frame', nsNode => new Frame())
  // there are 2 kinds of tab components in NS
  // 1 is TabView, which is basically Tab "Panel" only component
  //        this comes with different way of navigation on different OS
  // 1 is Tabs, which is Tab "panel" + Tabs bar
  //        this is a traditional style tab UI
  .register('TabView', nsNode => new TabView())
  // todo: TabViewItem only inherits from ViewBase,
  // and thus is invalid NsView
  .register('TabViewItem', nsNode => new TabViewItem() as unknown as NsView)

  .register('Tabs', nsNode => {
    return new Tabs();
  })
  .register('TabStrip', nsNode => new TabStrip())
  .register('TabStripItem', nsNode => new TabStripItem())
  .register('TabContentItem', nsNode => new TabContentItem());
