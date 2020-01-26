import { IContainer, PLATFORM, Registration, Protocol, Metadata } from '@aurelia/kernel';
import { ICustomMessages, IValidationRules, ValidationMessageProvider, ValidationRules } from './rule-provider';
import { IValidationMessageProvider } from './rules';
import { ValidationErrorsCustomAttribute } from './subscribers/validation-errors-custom-attribute';
import { IDefaultTrigger, ValidateBindingBehavior, ValidationTrigger } from './validate-binding-behavior';
import { IValidationControllerFactory, ValidationControllerFactory, IValidationController } from './validation-controller';
import { ValidationCustomizationOptions } from './validation-customization-options';
import { IValidator, StandardValidator } from './validator';

export type ValidationConfigurationProvider = (options: ValidationCustomizationOptions) => void;

function createConfiguration(optionsProvider: ValidationConfigurationProvider) {
  return {
    optionsProvider,
    register(container: IContainer) {
      const options: ValidationCustomizationOptions = { ValidatorType: StandardValidator, CustomMessages: [], DefaultTrigger: ValidationTrigger.blur };
      optionsProvider(options);

      const key = Protocol.annotation.keyFor('di:factory');
      // let factory = Metadata.getOwn(key, Type);
      // if (factory === void 0) {
      Metadata.define(key, new ValidationControllerFactory(), IValidationController);
      //   Protocol.annotation.appendTo(Type, key);
      // }

      return container.register(
        Registration.callback(ICustomMessages, () => options.CustomMessages),
        Registration.callback(IDefaultTrigger, () => options.DefaultTrigger),
        Registration.singleton(IValidator, options.ValidatorType),
        Registration.singleton(IValidationMessageProvider, ValidationMessageProvider), // TODO enable customization of messages and i18n
        Registration.transient(IValidationRules, ValidationRules),
        ValidateBindingBehavior,
        ValidationErrorsCustomAttribute,
        // Registration.singleton(IValidationControllerFactory, ValidationControllerFactory)
      );
    },
    customize(cb?: ValidationConfigurationProvider) {
      return createConfiguration(cb ?? optionsProvider);
    },
  };
}

export const ValidationConfiguration = createConfiguration(PLATFORM.noop);
