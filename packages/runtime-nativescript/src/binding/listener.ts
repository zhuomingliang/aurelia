import { IDisposable, IIndexable, IServiceLocator } from '@aurelia/kernel';
import {
  DelegationStrategy,
  hasBind,
  hasUnbind,
  IBinding,
  IConnectableBinding,
  IDOM,
  IsBindingBehavior,
  IScope,
  LifecycleFlags,
  State
} from '@aurelia/runtime';
import { IEventManager } from '../observation/event-manager';
import { View, EventData } from '@nativescript/core';

export interface Listener extends IConnectableBinding {}
/**
 * Listener binding. Handle event binding between view and view model
 */
export class Listener implements IBinding {
  public interceptor: this = this;

  public $state: State = State.none;
  public $scope!: IScope;
  public part?: string;

  private handler!: IDisposable;

  public constructor(
    public dom: IDOM,
    public targetEvent: string,
    public delegationStrategy: DelegationStrategy,
    public sourceExpression: IsBindingBehavior,
    public target: View,
    public preventDefault: boolean,
    public eventManager: IEventManager,
    public locator: IServiceLocator,
  ) {
    this.handleEvent = this.handleEvent.bind(this);
  }

  public callSource(event: EventData): ReturnType<IsBindingBehavior['evaluate']> {
    const overrideContext = this.$scope.overrideContext;
    overrideContext.$event = event;

    const result = this.sourceExpression.evaluate(LifecycleFlags.mustEvaluate, this.$scope, this.locator, this.part);

    Reflect.deleteProperty(overrideContext, '$event');

    // if (result !== true && this.preventDefault) {
    //   event.preventDefault();
    // }

    return result;
  }

  public handleEvent(event: EventData): void {
    this.interceptor.callSource(event);
  }

  public $bind(flags: LifecycleFlags, scope: IScope, part?: string): void {
    if (this.$state & State.isBound) {
      if (this.$scope === scope) {
        return;
      }

      this.interceptor.$unbind(flags | LifecycleFlags.fromBind);
    }
    // add isBinding flag
    this.$state |= State.isBinding;

    this.$scope = scope;
    this.part = part;

    const sourceExpression = this.sourceExpression;
    if (hasBind(sourceExpression)) {
      sourceExpression.bind(flags, scope, this.interceptor);
    }

    this.handler = this.eventManager.addEventListener(
      this.dom,
      this.target,
      this.targetEvent,
      this.handleEvent,
      this.delegationStrategy
    );

    // add isBound flag and remove isBinding flag
    this.$state |= State.isBound;
    this.$state &= ~State.isBinding;
  }

  public $unbind(flags: LifecycleFlags): void {
    if ((this.$state & State.isBound) === 0) {
      return;
    }
    // add isUnbinding flag
    this.$state |= State.isUnbinding;

    const sourceExpression = this.sourceExpression;
    if (hasUnbind(sourceExpression)) {
      sourceExpression.unbind(flags, this.$scope, this.interceptor);
    }

    this.$scope = null!;
    this.handler.dispose();
    this.handler = null!;

    // remove isBound and isUnbinding flags
    this.$state &= ~(State.isBound | State.isUnbinding);
  }

  public observeProperty(flags: LifecycleFlags, obj: IIndexable, propertyName: string): void {
    return;
  }

  public handleChange(newValue: unknown, previousValue: unknown, flags: LifecycleFlags): void {
    return;
  }
}
