import {
  IAttributeParser,
  ResourceModel,
  SymbolFlags,
} from '@aurelia/jit';
import {
  IContainer,
  IResolver,
  mergeDistinct,
  PLATFORM,
  Registration,
  mergeArrays,
} from '@aurelia/kernel';
import {
  HydrateAttributeInstruction,
  HydrateElementInstruction,
  HydrateTemplateController,
  IExpressionParser,
  IInterpolationExpression,
  ILetBindingInstruction,
  InterpolationInstruction,
  IsBindingBehavior,
  ITargetedInstruction,
  ITemplateCompiler,
  PartialCustomElementDefinition,
  LetBindingInstruction,
  LetElementInstruction,
  SetPropertyInstruction,
  CustomElementDefinition,
  IDOM
} from '@aurelia/runtime';
import { TemplateBinder } from './template-binder';
import { ITemplateElementFactory } from './template-element-factory';

class CustomElementCompilationUnit {
  public readonly instructions: ITargetedInstruction[][] = [];
  public readonly surrogates: ITargetedInstruction[] = [];
  public readonly scopeParts: string[] = [];
  public readonly parts: Record<string, PartialCustomElementDefinition> = {};

  public constructor(
    public readonly partialDefinition: PartialCustomElementDefinition,
    public readonly surrogate: any, // The root symbol
    public readonly template: unknown,
  ) {}

  public toDefinition(): CustomElementDefinition {
    const def = this.partialDefinition;

    return CustomElementDefinition.create({
      ...def,
      instructions: mergeArrays(def.instructions, this.instructions),
      surrogates: mergeArrays(def.surrogates, this.surrogates),
      scopeParts: mergeArrays(def.scopeParts, this.scopeParts),
      template: this.template,
      needsCompile: false,
      hasSlots: this.surrogate.hasSlots,
    });
  }
}

/**
 * Default (runtime-agnostic) implementation for `ITemplateCompiler`.
 *
 * @internal
 */
export class TemplateCompiler implements ITemplateCompiler {

  private compilation!: CustomElementCompilationUnit;

  public constructor(
    @ITemplateElementFactory private readonly factory: ITemplateElementFactory,
    @IAttributeParser private readonly attrParser: IAttributeParser,
    @IExpressionParser private readonly exprParser: IExpressionParser,
  ) {}

  public static register(container: IContainer): IResolver<ITemplateCompiler> {
    return Registration.singleton(ITemplateCompiler, this).register(container);
  }

  public compile(partialDefinition: PartialCustomElementDefinition, context: IContainer): CustomElementDefinition {
    const definition = CustomElementDefinition.getOrCreate(partialDefinition);
    if (definition.template === null || definition.template === void 0) {
      return definition;
    }

    const resources = ResourceModel.getOrCreate(context);
    const { attrParser, exprParser, factory } = this;

    const binder = new TemplateBinder(context.get(IDOM), resources, attrParser, exprParser);

    const template = factory.createTemplate(definition.template);
    const surrogate = binder.bind(template);

    const compilation = this.compilation = new CustomElementCompilationUnit(definition, surrogate, template);

    // Note: just like with the template binder, the code in jit-html was not meant to be html-specific so it would be fine for now to just copy the code from jit-html, adjust the typings, and take it from there.
    // We can define a html-agnostic variant of the compiler later on.
    // this.compileChildNodes(surrogate, compilation.instructions, compilation.scopeParts);

    const compiledDefinition = compilation.toDefinition();
    this.compilation = null!;

    return compiledDefinition;
  }
}
