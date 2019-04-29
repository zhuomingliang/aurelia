import { IController, IBinding, IViewModel } from './lifecycle';
import { INode } from './dom';
import { IBindingTargetAccessor, ISubscriber, ISubscriberCollection } from './observation';
import { DI, IContainer, Registration } from '@aurelia/kernel';
import { Binding } from './binding/binding';

export const IComponentVisitor = DI.createInterface<IComponentVisitor>('IComponentVisitor').noDefault();

export interface IComponentVisitor<T extends INode = INode> {
  visitController(controller: IController<T>): void;
  visitBinding(binding: IBinding): void;
  visitTargetAccessor(accessor: IBindingTargetAccessor): void;
  visitViewModel(viewModel: IViewModel<T>): void;
}

export class ComponentVisitor<T extends INode = INode> implements IComponentVisitor<T> {
  public static register(container: IContainer): void {
    Registration.singleton(this, this).register(container);
  }

  public visitController(controller: IController<T>): void {
    const { bindings, controllers, viewModel } = controller;

    if (viewModel != void 0) {
      this.visitViewModel(viewModel);
    }

    if (bindings != void 0) {
      const { length } = bindings;
      for (let i = 0; i < length; ++i) {
        this.visitBinding(bindings[i]);
      }
    }

    if (controllers != void 0) {
      const { length } = controllers;
      for (let i = 0; i < length; ++i) {
        this.visitController(controllers[i]);
      }
    }
  }

  public visitBinding(binding: IBinding): void {
    if (binding instanceof Binding) {
      const { targetObserver } = binding;
      if (targetObserver != void 0) {
        this.visitTargetAccessor(targetObserver);
      }

      const {
        _subscriber0,
        _subscriber1,
        _subscriber2,
        _subscribersRest,
      } = (binding as typeof binding & ISubscriberCollection);

      if (_subscriber0 != void 0) {
        this.visitSubscriber(_subscriber0);
      }

      if (_subscriber1 != void 0) {
        this.visitSubscriber(_subscriber1);
      }

      if (_subscriber2 != void 0) {
        this.visitSubscriber(_subscriber2);
      }

      if (_subscribersRest != void 0) {
        const { length } = _subscribersRest;
        for (let i = 0; i < length; ++i) {
          this.visitSubscriber(_subscribersRest[i]);
        }
      }
    }
  }

  public visitTargetAccessor(accessor: IBindingTargetAccessor): void {

  }

  public visitSubscriber(subscriber: ISubscriber): void {

  }

  public visitViewModel(viewModel: IViewModel<T>): void {

  }
}
