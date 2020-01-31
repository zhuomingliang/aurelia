import {
  BindingMode,
  BindingType,
  ensureExpression,
  IRenderableController,
  IExpressionParser,
  IInstructionRenderer,
  instructionRenderer,
  InterpolationBinding,
  IObserverLocator,
  ICompiledRenderContext,
  LifecycleFlags,
  MultiInterpolationBinding,
  PropertyBinding,
  applyBindingBehavior,
  IsBindingBehavior,
  TargetedInstructionType,
  IHydrateElementInstruction,
  PartialCustomElementDefinitionParts,
  CustomElement,
  ICustomElementViewModel,
  ILifecycle,
  Controller,
} from '@aurelia/runtime';
import { Listener } from './binding/listener';
import {
  NsTargetedInstructionType,
  IListenerBindingInstruction,
  ITextBindingInstruction,
} from './definitions';
import { IEventManager } from './observation/event-manager';
import { NsNode, NsView } from './dom';
import { IIndexable, Metadata } from '@aurelia/kernel';

// @instructionRenderer(TargetedInstructionType.hydrateElement)
// /** @internal */
// export class CustomElementRenderer implements IInstructionRenderer {

//   public render(
//     flags: LifecycleFlags,
//     context: ICompiledRenderContext,
//     controller: IRenderableController,
//     target: NsNode,
//     instruction: IHydrateElementInstruction,
//     parts: PartialCustomElementDefinitionParts | undefined,
//   ): void {
//     parts = mergeParts(parts, instruction.parts);

//     // this ns view is only a dummy view, and needs upgrade
//     // because our custom element could be anything
//     const nsView: NsView = target.createNsView();// this.nsViewResource.create(target as INodeInfo);

//     const factory = context.getComponentFactory(
//       /* parentController */controller,
//       /* host             */nsView,
//       /* instruction      */instruction,
//       /* viewFactory      */void 0,
//       /* location         */target,
//     );

//     const key = CustomElement.keyFrom(instruction.res);
//     const component = factory.createComponent<ICustomElementViewModel<NsView>>(key);

//     const lifecycle = context.get(ILifecycle);
//     const childController = Controller.forCustomElement(
//       /* viewModel       */component,
//       /* lifecycle       */lifecycle,
//       /* host            */nsView,
//       /* parentContainer */context,
//       /* parts           */parts,
//       /* flags           */flags,
//     );

//     flags = childController.flags;
//     Metadata.define(key, childController, target);

//     context.renderInstructions(
//       /* flags        */flags,
//       /* instructions */instruction.instructions,
//       /* controller   */controller,
//       /* target       */childController,
//       /* parts        */parts,
//     );

//     controller.addController(childController);

//     factory.dispose();
//   }
// }

@instructionRenderer(NsTargetedInstructionType.textBinding)
/** @internal */
export class TextBindingRenderer implements IInstructionRenderer {
  public constructor(
    @IExpressionParser private readonly parser: IExpressionParser,
    @IObserverLocator private readonly observerLocator: IObserverLocator,
  ) {}

  public render(
    flags: LifecycleFlags,
    context: ICompiledRenderContext,
    controller: IRenderableController,
    target: NsNode,
    instruction: ITextBindingInstruction,
  ): void {
    const next = target.nextSibling;
    if (context.dom.isMarker(target)) {
      context.dom.remove(target);
    }
    let binding: MultiInterpolationBinding | InterpolationBinding;
    const expr = ensureExpression(this.parser, instruction.from, BindingType.Interpolation);
    if (expr.isMulti) {
      binding = applyBindingBehavior(
        new MultiInterpolationBinding(this.observerLocator, expr, next!, 'textContent', BindingMode.toView, context),
        expr as unknown as IsBindingBehavior,
        context,
      ) as MultiInterpolationBinding;
    } else {
      binding = applyBindingBehavior(
        new InterpolationBinding(expr.firstExpression, expr, next!, 'textContent', BindingMode.toView, this.observerLocator, context, true),
        expr as unknown as IsBindingBehavior,
        context,
      ) as InterpolationBinding;
    }
    controller.addBinding(binding);
  }
}

@instructionRenderer(NsTargetedInstructionType.listenerBinding)
/** @internal */
export class ListenerBindingRenderer implements IInstructionRenderer {
  public constructor(
    @IExpressionParser private readonly parser: IExpressionParser,
    @IEventManager private readonly eventManager: IEventManager,
  ) {}

  public render(
    flags: LifecycleFlags,
    context: ICompiledRenderContext,
    controller: IRenderableController,
    target: NsView,
    instruction: IListenerBindingInstruction,
  ): void {
    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    const expr = ensureExpression(this.parser, instruction.from, BindingType.IsEventCommand | (instruction.strategy + BindingType.DelegationStrategyDelta));
    const binding = applyBindingBehavior(
      new Listener(context.dom, instruction.to, instruction.strategy, expr, target, instruction.preventDefault, this.eventManager, context),
      expr,
      context,
    );
    controller.addBinding(binding);
  }
}

const parentPartsOwnPartsLookup = new WeakMap<PartialCustomElementDefinitionParts, WeakMap<PartialCustomElementDefinitionParts, PartialCustomElementDefinitionParts>>();

/**
 * Efficiently merge parts, performing the minimal amount of work / using the minimal amount of memory.
 *
 * If either of the two part records is undefined, the other will simply be returned.
 *
 * If both are undefined, undefined will be returned.
 *
 * If neither are undefined, a new object will be returned where parts of the second value will be written last (and thus may overwrite duplicate named parts).
 *
 * This function is idempotent via a WeakMap cache: results are cached and if the same two variables are provided again, the same object will be returned.
 */
export function mergeParts(
  parentParts: PartialCustomElementDefinitionParts | undefined,
  ownParts: PartialCustomElementDefinitionParts | undefined,
): PartialCustomElementDefinitionParts | undefined {
  if (parentParts === ownParts) {
    return parentParts;
  }
  if (parentParts === void 0) {
    return ownParts;
  }
  if (ownParts === void 0) {
    return parentParts;
  }

  let ownPartsLookup = parentPartsOwnPartsLookup.get(parentParts);
  if (ownPartsLookup === void 0) {
    parentPartsOwnPartsLookup.set(
      parentParts,
      ownPartsLookup = new WeakMap(),
    );
  }

  let mergedParts = ownPartsLookup.get(ownParts);
  if (mergedParts === void 0) {
    ownPartsLookup.set(
      ownParts,
      mergedParts = {
        ...parentParts,
        ...ownParts,
      },
    );
  }

  return mergedParts;
}
