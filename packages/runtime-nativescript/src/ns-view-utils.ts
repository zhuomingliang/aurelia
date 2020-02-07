import { NsView } from './dom';
import { Page, LayoutBase } from '@nativescript/core';
import { AddChildFromBuilder } from '@nativescript/core/ui/page/page';

const isPage = (view: NsView): view is Page => view instanceof Page;
const isLayout = (view: NsView): view is LayoutBase => view instanceof LayoutBase;

export function appendManyChildViews(parent: NsView, children: ArrayLike<NsView>): ArrayLike<NsView> {
  if (isPage(parent)) {
    if (children.length > 0) {
      if (children.length > 1) {
        console.error('Invalid Page content operation. More than 1 child is attempted to add to a page');
        debugger;
      }
      parent.content = children[0];
    }
  } else if (isLayout(parent)) {
    for (let i = 0, ii = children.length; ii > i; ++i) {
      const child = children[i];
      parent.addChild(child);
    }
  } else {
    // from NS source code, it seems Tabs/TabView use special method to deal with tab stuff
    // so check it here before resolving to normal ._addView
    const $parent = parent as unknown as AddChildFromBuilder;
    if (typeof $parent._addChildFromBuilder === 'function') {
      for (let i = 0, ii = children.length; ii > i; ++i) {
        const child = children[i];
        $parent._addChildFromBuilder(child.typeName, child);
      }
    } else {
      for (let i = 0, ii = children.length; ii > i; ++i) {
        const child = children[i];
        parent._addView(child);
      }
    }
  }
  return children;
}

export function appendChildView<TChild extends NsView = NsView>(parent: NsView, child: TChild): TChild {
  if (isPage(parent)) {
    parent.content = child;
  } else if (isLayout(parent)) {
    parent.addChild(child);
  } else {
    // from NS source code, it seems Tabs/TabView use special method to deal with tab stuff
    // so check it here before resolving to normal ._addView
    const $parent = parent as unknown as AddChildFromBuilder;
    if (typeof $parent._addChildFromBuilder === 'function') {
      $parent._addChildFromBuilder(child.typeName, child);
    } else {
      parent._addView(child);
    }
  }
  return child;
}
