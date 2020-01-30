import { IContainer, IResolver, Registration, IIndexable } from '@aurelia/kernel';
import {
  IBindingTargetAccessor,
  IBindingTargetObserver,
  IDOM,
  ILifecycle,
  IObserverLocator,
  ITargetAccessorLocator,
  ITargetObserverLocator,
  LifecycleFlags,
  IScheduler,
  PropertyAccessor
} from '@aurelia/runtime';
import { NsView, NsDOM } from '../dom';

// import {
//   ListView,
//   Observable,
//   PropertyChangeData,
//   EventData
// } from '@nativescript/core';
import { NsObservableObserver } from './observable-observer';

const overrideProps = Object.assign(
  Object.create(null),
  {
    // 'class': true,
    // 'style': true,
    // 'css': true,
    'checked': true,
    'value': true,
    'model': true,
    // 'xlink:actuate': true,
    // 'xlink:arcrole': true,
    // 'xlink:href': true,
    // 'xlink:role': true,
    // 'xlink:show': true,
    // 'xlink:title': true,
    // 'xlink:type': true,
    // 'xml:lang': true,
    // 'xml:space': true,
    // 'xmlns': true,
    // 'xmlns:xlink': true,
  }
) as Record<string, boolean>;

export class TargetObserverLocator implements ITargetObserverLocator {

  public static register(container: IContainer): IResolver<ITargetObserverLocator> {
    return Registration.singleton(ITargetObserverLocator, this).register(container);
  }

  public constructor(
    @IDOM private readonly dom: NsDOM,
    // @ISVGAnalyzer private readonly svgAnalyzer: ISVGAnalyzer,
  ) {}

  public getObserver(
    flags: LifecycleFlags,
    scheduler: IScheduler,
    lifecycle: ILifecycle,
    observerLocator: IObserverLocator,
    obj: NsView,
    propertyName: string,
  ): IBindingTargetObserver | IBindingTargetAccessor {
    return new NsObservableObserver(scheduler, flags, obj as NsView & IIndexable, propertyName);
  }

  public overridesAccessor(flags: LifecycleFlags, obj: NsView, propertyName: string): boolean {
    return overrideProps[propertyName] === true;
  }

  public handles(flags: LifecycleFlags, obj: unknown): boolean {
    return this.dom.isNodeInstance(obj) && obj.hasView;
  }
}

export class TargetAccessorLocator implements ITargetAccessorLocator {

  public static register(container: IContainer): IResolver<ITargetAccessorLocator> {
    return Registration.singleton(ITargetAccessorLocator, this).register(container);
  }

  public constructor(
    @IDOM private readonly dom: IDOM,
    // @ISVGAnalyzer private readonly svgAnalyzer: ISVGAnalyzer,
  ) {}

  public getAccessor(
    flags: LifecycleFlags,
    scheduler: IScheduler,
    lifecycle: ILifecycle,
    obj: NsView,
    propertyName: string,
  ): IBindingTargetAccessor {
    return new PropertyAccessor(obj as unknown as Record<string, unknown>, propertyName);
  }

  public handles(flags: LifecycleFlags, obj: NsView): boolean {
    return this.dom.isNodeInstance(obj);
  }
}
