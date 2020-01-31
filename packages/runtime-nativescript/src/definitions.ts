import {
  AttributeInstruction,
  DelegationStrategy,
  IInterpolationExpression,
  IsBindingBehavior,
  ITargetedInstruction,
  NodeInstruction
} from '@aurelia/runtime';

export const enum NsTargetedInstructionType {
  textBinding = 'na',
  listenerBinding = 'nb',
  attributeBinding = 'nc',
  stylePropertyBinding = 'nd',
  setAttribute = 'ne',
  setClassAttribute = 'nf',
  setStyleAttribute = 'ng',
}

export type NsNodeInstruction =
  NodeInstruction |
  ITextBindingInstruction;

export type NsAttributeInstruction =
  AttributeInstruction |
  IListenerBindingInstruction |
  IAttributeBindingInstruction;

export type NsTargetedInstruction = NsNodeInstruction | NsAttributeInstruction;
// TODO: further improve specificity and integrate with the definitions;
export type NsInstructionRow = [NsTargetedInstruction, ...NsAttributeInstruction[]];

export function isNsTargetedInstruction(value: unknown): value is NsTargetedInstruction {
  const type = (value as { type?: string }).type;
  return typeof type === 'string' && type.length === 2 && type[0] === 'n';
}

export interface ITextBindingInstruction extends ITargetedInstruction {
  type: NsTargetedInstructionType.textBinding;
  from: string | IInterpolationExpression;
}

export interface IListenerBindingInstruction extends ITargetedInstruction {
  type: NsTargetedInstructionType.listenerBinding;
  from: string | IsBindingBehavior;
  to: string;
  strategy: DelegationStrategy;
  preventDefault: boolean;
}

export interface IAttributeBindingInstruction extends ITargetedInstruction {
  type: NsTargetedInstructionType.attributeBinding;
  from: string | IsBindingBehavior;

  /**
   * `attr` and `to` have the same value on a normal attribute
   * Will be different on `class` and `style`
   * on `class`: attr = `class` (from binding command), to = attribute name
   * on `style`: attr = `style` (from binding command), to = attribute name
   */
  attr: string;
  to: string;
}
