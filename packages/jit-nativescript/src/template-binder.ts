import { IDOM, IExpressionParser } from '@aurelia/runtime';
import { ResourceModel, IAttributeParser } from '@aurelia/jit';

// Note: the template-binder at packages\jit-html\src\template-binder.ts was never meant to be completely html-specific so probably it can be 80-90% reused (start with copy paste?).
// It's just that I hadn't worked with other DOMs before so I didn't know what specifically needed to be abstracted, hence I stuck to just not abstracting anything until either I learned about other DOMs or someone who knew about other DOMs would step in :-)

export class TemplateBinder {
  public constructor(
    public readonly dom: IDOM,
    public readonly resources: ResourceModel,
    public readonly attrParser: IAttributeParser,
    public readonly exprParser: IExpressionParser,
  ) {}

  public bind(node: any): any {
    throw new Error('Not implemented');
  }
}
