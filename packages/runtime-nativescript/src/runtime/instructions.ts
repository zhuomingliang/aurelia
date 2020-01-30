import {
  DelegationStrategy,
  IInterpolationExpression,
  IsBindingBehavior,
  ITargetedInstruction
} from '@aurelia/runtime';
import {
  NsTargetedInstructionType,
  IAttributeBindingInstruction,
  IListenerBindingInstruction,
  IStylePropertyBindingInstruction,
  ITextBindingInstruction
} from './definitions';

export class TextBindingInstruction implements ITextBindingInstruction {
  public type: NsTargetedInstructionType.textBinding = NsTargetedInstructionType.textBinding;

  public constructor(
    public from: string | IInterpolationExpression,
  ) {}
}

export class TriggerBindingInstruction implements IListenerBindingInstruction {
  public type: NsTargetedInstructionType.listenerBinding = NsTargetedInstructionType.listenerBinding;

  public preventDefault: true = true;
  public strategy: DelegationStrategy.none = DelegationStrategy.none;

  public constructor(
    public from: string | IsBindingBehavior,
    public to: string,
  ) {}
}

export class DelegateBindingInstruction implements IListenerBindingInstruction {
  public type: NsTargetedInstructionType.listenerBinding = NsTargetedInstructionType.listenerBinding;

  public preventDefault: false = false;
  public strategy: DelegationStrategy.bubbling = DelegationStrategy.bubbling;

  public constructor(
    public from: string | IsBindingBehavior,
    public to: string,
  ) {}
}

export class CaptureBindingInstruction implements IListenerBindingInstruction {
  public type: NsTargetedInstructionType.listenerBinding = NsTargetedInstructionType.listenerBinding;

  public preventDefault: false = false;
  public strategy: DelegationStrategy.capturing = DelegationStrategy.capturing;

  public constructor(
    public from: string | IsBindingBehavior,
    public to: string,
  ) {}
}

export class StylePropertyBindingInstruction implements IStylePropertyBindingInstruction {
  public type: NsTargetedInstructionType.stylePropertyBinding = NsTargetedInstructionType.stylePropertyBinding;

  public constructor(
    public from: string | IsBindingBehavior,
    public to: string,
  ) {}
}

export class SetAttributeInstruction implements ITargetedInstruction {
  public type: NsTargetedInstructionType.setAttribute = NsTargetedInstructionType.setAttribute;

  public constructor(
    public value: string,
    public to: string,
  ) {}
}

export class SetClassAttributeInstruction implements ITargetedInstruction {
  public readonly type: NsTargetedInstructionType.setClassAttribute = NsTargetedInstructionType.setClassAttribute;

  public constructor(
    public readonly value: string,
  ) {}
}

export class SetStyleAttributeInstruction implements ITargetedInstruction {
  public readonly type: NsTargetedInstructionType.setStyleAttribute = NsTargetedInstructionType.setStyleAttribute;

  public constructor(
    public readonly value: string,
  ) {}
}

export class AttributeBindingInstruction implements IAttributeBindingInstruction {
  public type: NsTargetedInstructionType.attributeBinding = NsTargetedInstructionType.attributeBinding;

  public constructor(
    /**
     * `attr` and `to` have the same value on a normal attribute
     * Will be different on `class` and `style`
     * on `class`: attr = `class` (from binding command), to = attribute name
     * on `style`: attr = `style` (from binding command), to = attribute name
     */
    public attr: string,
    public from: string | IsBindingBehavior,
    public to: string,
  ) {}
}
