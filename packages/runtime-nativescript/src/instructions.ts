import {
  DelegationStrategy,
  IInterpolationExpression,
  IsBindingBehavior,
  ITargetedInstruction
} from '@aurelia/runtime';
import {
  NsTargetedInstructionType,
  IListenerBindingInstruction,
  ITextBindingInstruction,
  IListItemTemplatesBindingInstruction
} from './definitions';
import { NsNode } from './dom';

export class NsTextBindingInstruction implements ITextBindingInstruction {
  public type: NsTargetedInstructionType.textBinding = NsTargetedInstructionType.textBinding;

  public constructor(
    public from: string | IInterpolationExpression,
  ) {}
}

export class NsTriggerBindingInstruction implements IListenerBindingInstruction {
  public type: NsTargetedInstructionType.listenerBinding = NsTargetedInstructionType.listenerBinding;

  public preventDefault: true = true;
  public strategy: DelegationStrategy.none = DelegationStrategy.none;

  public constructor(
    public from: string | IsBindingBehavior,
    public to: string,
  ) {}
}

export class NsListItemTemplatesInstruction implements IListItemTemplatesBindingInstruction {
  public readonly type: NsTargetedInstructionType.listItemTemplates = NsTargetedInstructionType.listItemTemplates;
  public constructor(
    public readonly templates: NsNode[]
  ) {}
}
