import { IServiceLocator, DI } from '@aurelia/kernel';
import { expect } from 'chai';
import { Hooks, ICustomElementType,  IDOM, INode, IProjectorLocator, IRenderingEngine, ITemplate, LifecycleFlags as LF } from '../../src/index';
import { createCustomElement, CustomElement } from '../resources/custom-element._builder';
import { eachCartesianJoin } from '../util';
import { LifecycleFlags, SelfObserver } from '../../src/index';

describe.only('@bindable-observer', function () {

  const testCases: IBindableObserverSpec[] = [
    {
      title: 'Base GetterSetter Strategy',
      Type: class Abc {
        getCount: number = 0;
        setCount: number = 0;
        _foo: any;
        get foo() {
          this.getCount++;
          return this._foo;
        }
        set foo(v: any) {
          this.setCount++;
          this._foo = v;
        }
      },
      baseFlags: LifecycleFlags.getterSetterStrategy,
      verifyConstructor: (observer, abc) => {
        // expect(observer.getValue, 'observer.getValueDirect ✔').to.equal(SelfObserver.prototype.getValueDirect);
        expect(observer.getValue, 'observer.getValueSetter ✔').to.equal(SelfObserver.prototype.getValueGetter);
        expect(abc.getCount, 'private.getCount').to.equal(1);
        const fooDescriptor = Object.getOwnPropertyDescriptor(abc, 'foo');
        expect(fooDescriptor, 'obj[[foo -descriptor]]').to.equal(undefined);
      },
      verifyGetValue: abc => {

      },
      verifySetValue: abc => {

      }
    }
  ];

  eachCartesianJoin(
    [testCases],
    ({ title, Type, baseFlags, verifyConstructor, verifyGetValue, verifySetValue}) => {
      it(title, function() {
        const ct = DI.createContainer();
        const instance = ct.get(Type);
        const observer = new SelfObserver(LifecycleFlags.none | baseFlags, instance, 'foo', '');
        verifyConstructor(observer, instance);
        verifyGetValue(observer, instance);
        verifySetValue(observer, instance);
      });
    }
  );

  interface IBindableObserverSpec<T = any> {
    title: string;
    Type: { new (...args: any[]): T };
    baseFlags: LifecycleFlags;
    verifyConstructor(observer: SelfObserver, instance: T): void;
    verifyGetValue(observer: SelfObserver, instance: T): void;
    verifySetValue(observer: SelfObserver, instance: T): void;
  }
});
