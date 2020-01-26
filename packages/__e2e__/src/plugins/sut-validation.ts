import { forScope, newInstanceOf } from "@aurelia/kernel";
import { bindable, customElement } from '@aurelia/runtime';
import { IValidationController } from '@aurelia/validation';

@customElement({
    name: 'sut-validation',
    template: `<foo-bar root-controller.bind="controller1" controller2.bind="controller2"></foo-bar>`
})
export class SutValidation {
    public constructor(
        @forScope(IValidationController) private readonly controller1: IValidationController,
        @newInstanceOf(IValidationController) private readonly controller2: IValidationController,
        @IValidationController private readonly controller3: IValidationController,
    ) {
        console.group(`sut-validation ctor`);
        console.log(`controller1: ${!!controller1}`); // true
        console.log(`controller2: ${!!controller2}`); // true
        console.log(`Object.is(controller1, controller2): ${Object.is(controller1, controller2)}`); // false
        console.log(`Object.is(controller1, controller3): ${Object.is(controller1, controller3)}`); // true
        console.groupEnd();
    }
}

@customElement({ name: 'foo-bar', template: '' })
export class FooBar {
    @bindable public rootController: IValidationController;
    @bindable public controller2: IValidationController;
    public constructor(
        @IValidationController private readonly controller: IValidationController,
    ) {
        console.group(`foo-bar ctor`);
        console.log(`controller: ${!!controller}`); // true
        console.groupEnd();
    }

    public afterBind() {
        console.group(`foo-bar afterBind`);
        console.log(`root controller: ${!!this.rootController}`); // true
        console.log(`controller2: ${!!this.controller2}`); // true
        console.log(`Object.is(this.controller, this.rootController): ${Object.is(this.controller, this.rootController)}`); // true
        console.log(`Object.is(this.controller, controller2): ${Object.is(this.controller, this.controller2)}`); // false
        console.groupEnd();
    }
}
