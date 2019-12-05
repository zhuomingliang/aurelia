import { IContainer, PLATFORM, Registration } from '@aurelia/kernel';
import { ValidationRules } from './rule';
import { ValidateBindingBehavior } from './validate-binding-behavior';
import { IValidationController, ValidationController, ValidationControllerFactory, IValidationControllerFactory } from './validation-controller';
import { ValidationErrorsCustomAttribute } from './validation-errors-custom-attribute';
import { IValidationMessageProvider, ValidationMessageProvider } from './validation-messages';
import { ValidationRendererCustomAttribute } from './validation-renderer-custom-attribute';
import { IValidator, StandardValidator } from './validator';

export type ValidationConfigurationProvider = (options: ValidationCustomizationOpions) => void;
export interface ValidationCustomizationOpions {
  validator: typeof StandardValidator;
}

function createConfiguration(optionsProvider: ValidationConfigurationProvider) {
  return {
    optionsProvider,
    register(container: IContainer) {
      const options: ValidationCustomizationOpions = { validator: StandardValidator };
      optionsProvider(options);

      return container.register(
        Registration.singleton(IValidator, options.validator),
        Registration.singleton(IValidationMessageProvider, ValidationMessageProvider),
        ValidationRules,
        ValidateBindingBehavior,
        ValidationErrorsCustomAttribute,
        ValidationRendererCustomAttribute,
        Registration.singleton(IValidationController, ValidationController),
        Registration.singleton(IValidationControllerFactory, ValidationControllerFactory)
      );
    },
    customize(cb?: ValidationConfigurationProvider) {
      return createConfiguration(cb ?? optionsProvider);
    },
  };
}

export const ValidationConfiguration = createConfiguration(PLATFORM.noop);