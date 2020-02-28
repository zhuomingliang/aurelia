import { NsView } from './dom';
import { Page, LayoutBase, ScrollView, AbsoluteLayout } from '@nativescript/core';
import { AddChildFromBuilder, ContentView, View } from '@nativescript/core/ui/page/page';

const isPage = (view: NsView): view is Page => view instanceof Page;
const isLayout = (view: NsView): view is LayoutBase => view instanceof LayoutBase;
const isContentView = (view: NsView): view is ContentView => view instanceof ContentView;
const isAddChildFromBuilderImp = (view: NsView): view is NsView & AddChildFromBuilder =>
  view instanceof View && typeof (view as NsView & AddChildFromBuilder)._addChildFromBuilder === 'function';

export function appendManyChildViews(parent: NsView, children: ArrayLike<NsView>): ArrayLike<NsView> {
  if (isLayout(parent)) {
    for (let i = 0, ii = children.length; ii > i; ++i) {
      const child = children[i];
      parent.addChild(child);
    }
  } else if (isContentView(parent)) {
    if (children.length > 0) {
      if (children.length > 1) {
        console.error('Invalid Page content operation. More than 1 child is attempted to add to a page');
        debugger;
      }
      parent.content = children[0];
    }
  } else {
    if (isAddChildFromBuilderImp(parent)) {
      for (let i = 0, ii = children.length; ii > i; ++i) {
        const child = children[i];
        parent._addChildFromBuilder(child.typeName, child);
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
  if (isLayout(parent)) {
    parent.addChild(child);
  } else if (isContentView(parent)) {
    parent.content = child;
  } else {
    if (isAddChildFromBuilderImp(parent)) {
      parent._addChildFromBuilder(child.typeName, child);
    } else {
      parent._addView(child);
    }
  }
  return child;
}

export function replaceView(newView: NsView, oldView: NsView): NsView {
  if (newView === oldView) {
    return newView;
  }
  const parent = oldView.parent as NsView;
  if (parent == null) {
    throw new Error('Invalid view to replace, not attached to any parent');
  }
  if(!isLayout(parent)) {
    throw new Error(`Invalid parent "${parent.typeName}". Does not keep child index.`);
  }

  const index = parent.getChildIndex(oldView);
  parent.insertChild(newView, index);
  parent.removeChild(oldView);
  return newView;
}

export function insertManyViewsBefore(views: NsView[], refView: NsView): NsView[] {
  const parent = refView.parent as NsView;
  if (parent == null || !isLayout(parent)) {
    throw new Error(`Invalid view to insert before. Parent is not insert-able: ${String(parent?.typeName ?? typeof parent)}`);
  }

  const insertIndex = parent.getChildIndex(refView);
  for (let i = 0, ii = views.length; ii > i; ++i) {
    let newView = views[i];
    if (newView === refView) {
      continue;
    }
    parent.insertChild(newView, insertIndex);
  }
  return views;
}

export function insertBefore(newView: NsView, refView: NsView): NsView {
  if (newView === refView) {
    return newView;
  }
  const parent = refView.parent as NsView;
  if (parent == null || !isLayout(parent)) {
    throw new Error('Invalid view to insert before. Parent is not insert-able');
  }
  const index = parent.getChildIndex(refView);
  parent.insertChild(newView, index);
  return newView;
}
