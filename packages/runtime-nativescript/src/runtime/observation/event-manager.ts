import { DI, IDisposable } from '@aurelia/kernel';
import { DelegationStrategy, IDOM } from '@aurelia/runtime';
import { View, EventData } from '@nativescript/core';
import { NsView } from '../dom';

export class ListenerTracker {
  private count: number = 0;

  public constructor(
    private readonly dom: IDOM,
    private readonly eventName: string,
    private readonly listener: NsEventHandler,
    private readonly capture: boolean,
  ) {}

  public increment(): void {
    this.count++;
    if (this.count === 1) {
      this.dom.addEventListener(this.eventName, this.listener, null, this.capture);
    }
  }

  public decrement(): void {
    this.count--;
    if (this.count === 0) {
      this.dom.removeEventListener(this.eventName, this.listener, null, this.capture);
    }
  }

  /* @internal */
  public dispose(): void {
    if (this.count > 0) {
      this.count = 0;
      this.dom.removeEventListener(this.eventName, this.listener, null, this.capture);
    }
  }
}

/**
 * Enable dispose() pattern for addEventListener for `trigger`
 */
export class TriggerSubscription implements IDisposable {
  public constructor(
    private readonly dom: IDOM,
    public target: NsView,
    public targetEvent: string,
    public callback: NsEventHandler
  ) {
    dom.addEventListener(targetEvent, callback, target);
  }

  public dispose(): void {
    this.dom.removeEventListener(this.targetEvent, this.callback, this.target);
  }
}

export interface IElementConfiguration {
  tagName: string;
  properties: Record<string, string[]>;
}

export type NsEventHandler = (eventData: EventData) => void;

export interface IEventSubscriber extends IDisposable {
  subscribe(node: NsView, callbackOrListener: NsEventHandler): void;
}

export class EventSubscriber implements IEventSubscriber {
  private target: NsView = null!;
  private handler: NsEventHandler = null!;

  public constructor(
    private readonly dom: IDOM,
    private readonly events: string[],
  ) {}

  public subscribe(node: NsView, callbackOrListener: NsEventHandler): void {
    this.target = node;
    this.handler = callbackOrListener;

    const add = this.dom.addEventListener;
    const events = this.events;

    for (let i = 0, ii = events.length; ii > i; ++i) {
      add(events[i], callbackOrListener, node);
    }
  }

  public dispose(): void {
    const node = this.target;
    const callbackOrListener = this.handler;
    const events = this.events;
    const dom = this.dom;

    for (let i = 0, ii = events.length; ii > i; ++i) {
      dom.removeEventListener(events[i], callbackOrListener, node);
    }

    this.target = this.handler = null!;
  }
}

export type EventSubscription = TriggerSubscription;

export interface IEventManager extends IDisposable {
  addEventListener(dom: IDOM, target: View, targetEvent: string, callback: (eventData: EventData) => void, delegate: DelegationStrategy): IDisposable;
}

export const IEventManager = DI.createInterface<IEventManager>('IEventManager').withDefault(x => x.singleton(EventManager));

/** @internal */
export class EventManager implements IEventManager {

  public addEventListener(
    dom: IDOM,
    target: View,
    targetEvent: string,
    callbackOrListener: (eventData: EventData) => void,
    strategy: DelegationStrategy
  ): EventSubscription {
    return new TriggerSubscription(dom, target, targetEvent, callbackOrListener);
  }

  public dispose(): void {
    // let key: string;
    // const { delegatedHandlers, capturedHandlers } = this;
    // for (key in delegatedHandlers) {
    //   delegatedHandlers[key].dispose();
    // }
    // for (key in capturedHandlers) {
    //   capturedHandlers[key].dispose();
    // }
  }
}
