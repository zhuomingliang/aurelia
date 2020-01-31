import {
  bindingCommand,
  BindingSymbol,
  getTarget,
  BindingCommandInstance,
  PlainAttributeSymbol,
} from '@aurelia/jit';
import { BindingType, IsBindingBehavior, RefBindingInstruction } from '@aurelia/runtime';
import {
  NsAttributeInstruction,
  NsTriggerBindingInstruction
} from '@aurelia/runtime-nativescript';

/**
 * Trigger binding command. Compile attr with binding symbol with command `trigger` to `TriggerBindingInstruction`
 */
@bindingCommand('trigger')
export class TriggerBindingCommand implements BindingCommandInstance {
  public readonly bindingType: BindingType.TriggerCommand = BindingType.TriggerCommand;

  public compile(binding: PlainAttributeSymbol | BindingSymbol): NsAttributeInstruction {
    return new NsTriggerBindingInstruction(binding.expression as IsBindingBehavior, getTarget(binding, false));
  }
}

/**
 * Binding command to refer different targets (element, custom element/attribute view models, controller) afterAttach to an element
 */
@bindingCommand('ref')
export class RefBindingCommand implements BindingCommandInstance {
  public readonly bindingType: BindingType.IsProperty | BindingType.IgnoreCustomAttr = BindingType.IsProperty | BindingType.IgnoreCustomAttr;

  public compile(binding: PlainAttributeSymbol | BindingSymbol): RefBindingInstruction {
    return new RefBindingInstruction(binding.expression as IsBindingBehavior, getTarget(binding, false));
  }
}
