import { NsView } from './dom';
import { Page, LayoutBase } from '@nativescript/core';

export function appendManyChildViews(parent: NsView, children: NsView[]): NsView[] {
  if (parent instanceof Page) {
    if (children.length > 0) {
      if (children.length > 1) {
        console.error('Invalid Page content operation. More than 1 child is attempted to add to a page');
        debugger;
      }
      parent.content = children[0]
    }
  } else if (parent instanceof LayoutBase) {
    for (const child of children) {
      parent.addChild(child);
    }
  } else {
    for (const child of children) {
      parent._addView(child);
    }
  }
  return children;
}

export function appendChildView<TChild extends NsView = NsView>(parent: NsView, child: TChild): TChild {
  if (parent instanceof Page) {
    parent.content = child;
  } else if (parent instanceof LayoutBase) {
    parent.addChild(child);
  } else {
    parent._addView(child);
  }
  return child;
}
