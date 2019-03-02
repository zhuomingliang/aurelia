import { IIndexable, Tracer, Reporter } from '@aurelia/kernel';
import { LifecycleFlags } from '../flags';
import { IPropertyObserver, PropertyObserver, IPropertySubscriber } from '../observation';
import { propertyObserver } from './property-observer';
import { ProxyObserver } from './proxy-observer';
import { getPropertyDescriptor } from './observation-utilities';

const slice = Array.prototype.slice;

export interface SelfObserver extends IPropertyObserver<IIndexable, string> {}

@propertyObserver()
export class SelfObserver implements SelfObserver {
  public readonly persistentFlags: LifecycleFlags;
  public obj: object;
  public propertyKey: string;
  public currentValue: unknown;

  private readonly hasGetterAndSetter: boolean;
  private readonly callback: ((newValue: unknown, oldValue: unknown, flags: LifecycleFlags) => void) | null;
  private readonly propDescriptor: PropertyDescriptor;

  constructor(
    flags: LifecycleFlags,
    instance: object,
    propertyName: string,
    cbName: string
  ) {
    if (Tracer.enabled) { Tracer.enter('SelfObserver', 'constructor', slice.call(arguments)); }
    this.persistentFlags = flags & LifecycleFlags.persistentBindingFlags;
    this.propertyKey = propertyName;
    if (ProxyObserver.isProxy(instance)) {
      instance.$observer.subscribe(this, propertyName);
      this.obj = instance.$raw;
    } else {
      this.obj = instance;
    }
    this.currentValue = this.obj[propertyName];
    this.callback = this.obj[cbName] === undefined ? null : this.obj[cbName];
    
    if (flags & LifecycleFlags.patchStrategy) {
      this.getValue = this.getValueDirect;
    }
    // if not patch strategy
    // getter/setter are going to be defined on instance
    // needs to figure out proper getter/setter, based on existance of property on prototype chain
    else if (propertyName in this.obj) {
      const propDescriptor = getClassPropertyDescriptor(this.obj, propertyName);
      if (propDescriptor !== undefined) {
        const hasGetter = typeof propDescriptor.get === 'function'
        const hasSetter = typeof propDescriptor.set === 'function';
        const hasGetterAndSetter = hasGetter && hasSetter;
        if (!hasGetter || !hasSetter) {
          throw new Error('bindables cannot work with either readonly or writeonly property.');
        }
        this.hasGetterAndSetter = true;
        this.propDescriptor = propDescriptor;
        this.getValue = this.getValueGetter;
        this.setValue = this.setValueSetter;
      }
    }
    if (Tracer.enabled) { Tracer.leave(); }
  }

  public handleChange(newValue: unknown, oldValue: unknown, flags: LifecycleFlags): void {
    this.setValue(newValue, flags);
  }

  public getValueGetter(): unknown {
    return this.propDescriptor.get.call(this.obj);
  }
  public getValue(): unknown {
    return this.currentValue;
  }
  public getValueDirect(): unknown {
    return this.obj[this.propertyKey];
  }

  public setValueSetter(newValue: unknown, flags: LifecycleFlags): void {
    if (newValue !== this.currentValue || (flags & LifecycleFlags.patchStrategy) > 0) {
      if ((flags & LifecycleFlags.fromBind) === 0) {
        // is this correct?
        // if setter(s) modifies one of the dependencies of a getter,
        // should this be reevaluated? instead of simply getting a cached value
        // or it could help have cleaner app code by enforcing this constraint?
        const oldValue = this.currentValue;
        this.propDescriptor.set.call(this.obj, newValue);
        
        newValue = this.currentValue = this.propDescriptor.get.call(this.obj);
        flags |= this.persistentFlags;
        this.callSubscribers(newValue, oldValue, flags | LifecycleFlags.allowPublishRoundtrip);
        if (this.callback !== null) {
          this.callback.call(this.obj, newValue, oldValue, flags);
        }
      } else {
        this.currentValue = newValue;
      }
    }
  }
  public setValue(newValue: unknown, flags: LifecycleFlags): void {
    if (newValue !== this.currentValue || (flags & LifecycleFlags.patchStrategy) > 0) {
      if ((flags & LifecycleFlags.fromBind) === 0) {
        const oldValue = this.currentValue;
        flags |= this.persistentFlags;
        this.currentValue = newValue;
        this.callSubscribers(newValue, oldValue, flags | LifecycleFlags.allowPublishRoundtrip);
        if (this.callback !== null) {
          this.callback.call(this.obj, newValue, oldValue, flags);
        }
      } else {
        this.currentValue = newValue;
      }
    }
  }
  public $patch(flags: LifecycleFlags): void {
    const oldValue = this.currentValue;
    const newValue = this.obj[this.propertyKey];
    flags |= this.persistentFlags;
    this.currentValue = newValue;
    this.callSubscribers(newValue, oldValue, flags);
    if (this.callback !== null) {
      this.callback.call(this.obj, newValue, oldValue, flags);
    }
  }
}

const mappedClasses = new WeakMap();
const getClassPropertyDescriptor = (instanceOrConstructor: object | Function, propertyName: string) => {
  const Type = typeof instanceOrConstructor === 'function'
    ? instanceOrConstructor
    : instanceOrConstructor.constructor;

  let propDescriptor = mappedClasses.get(Type);
  if (propDescriptor === undefined) {
    propDescriptor = getPropertyDescriptor(Type.prototype, propertyName);
    mappedClasses.set(Type, propDescriptor);
  }
  return propDescriptor;
};
