var ChildrenObserver_1;
import * as tslib_1 from "tslib";
import { all, DI, IContainer, InstanceProvider, Reporter, RuntimeCompilationResources, } from '@aurelia/kernel';
import { buildTemplateDefinition, ITargetedInstruction, } from './definitions';
import { IDOM, IRenderLocation, NodeSequence, } from './dom';
import { IController, ILifecycle, IViewFactory, } from './lifecycle';
import { subscriberCollection } from './observation/subscriber-collection';
import { CustomElement, } from './resources/custom-element';
import { Controller } from './templating/controller';
import { ViewFactory } from './templating/view';
export const ITemplateCompiler = DI.createInterface('ITemplateCompiler').noDefault();
export var ViewCompileFlags;
(function (ViewCompileFlags) {
    ViewCompileFlags[ViewCompileFlags["none"] = 1] = "none";
    ViewCompileFlags[ViewCompileFlags["surrogate"] = 2] = "surrogate";
    ViewCompileFlags[ViewCompileFlags["shadowDOM"] = 4] = "shadowDOM";
})(ViewCompileFlags || (ViewCompileFlags = {}));
export const ITemplateFactory = DI.createInterface('ITemplateFactory').noDefault();
// This is the main implementation of ITemplate.
// It is used to create instances of IController based on a compiled TemplateDefinition.
// TemplateDefinitions are hand-coded today, but will ultimately be the output of the
// TemplateCompiler either through a JIT or AOT process.
// Essentially, CompiledTemplate wraps up the small bit of code that is needed to take a TemplateDefinition
// and create instances of it on demand.
export class CompiledTemplate {
    constructor(dom, definition, factory, renderContext) {
        this.dom = dom;
        this.definition = definition;
        this.factory = factory;
        this.renderContext = renderContext;
    }
    render(viewModelOrController, host, parts, flags = 0 /* none */) {
        const controller = viewModelOrController instanceof Controller
            ? viewModelOrController
            : viewModelOrController.$controller;
        if (controller == void 0) {
            throw new Error(`Controller is missing from the view model`); // TODO: create error code
        }
        const nodes = controller.nodes = this.factory.createNodeSequence();
        controller.context = this.renderContext;
        controller.scopeParts = this.definition.scopeParts;
        flags |= this.definition.strategy;
        this.renderContext.render(flags, controller, nodes.findTargets(), this.definition, host, parts);
    }
}
// This is an implementation of ITemplate that always returns a node sequence representing "no DOM" to render.
/** @internal */
export const noViewTemplate = {
    renderContext: (void 0),
    dom: (void 0),
    definition: (void 0),
    render(viewModelOrController) {
        const controller = viewModelOrController instanceof Controller ? viewModelOrController : viewModelOrController.$controller;
        controller.nodes = NodeSequence.empty;
        controller.context = void 0;
    }
};
const defaultCompilerName = 'default';
export const IInstructionRenderer = DI.createInterface('IInstructionRenderer').noDefault();
export const IRenderer = DI.createInterface('IRenderer').noDefault();
export const IRenderingEngine = DI.createInterface('IRenderingEngine').withDefault(x => x.singleton(RenderingEngine));
/** @internal */
export class RenderingEngine {
    constructor(container, templateFactory, lifecycle, templateCompilers) {
        this.container = container;
        this.templateFactory = templateFactory;
        this.viewFactoryLookup = new Map();
        this.lifecycle = lifecycle;
        this.templateLookup = new Map();
        this.compilers = templateCompilers.reduce((acc, item) => {
            acc[item.name] = item;
            return acc;
        }, Object.create(null));
    }
    // @ts-ignore
    getElementTemplate(dom, definition, parentContext, componentType) {
        if (definition == void 0) {
            return void 0;
        }
        let found = this.templateLookup.get(definition);
        if (!found) {
            found = this.templateFromSource(dom, definition, parentContext, componentType);
            this.templateLookup.set(definition, found);
        }
        return found;
    }
    getViewFactory(dom, definition, parentContext) {
        if (definition == void 0) {
            throw new Error(`No definition provided`); // TODO: create error code
        }
        let factory = this.viewFactoryLookup.get(definition);
        if (!factory) {
            const validSource = buildTemplateDefinition(null, definition);
            const template = this.templateFromSource(dom, validSource, parentContext, void 0);
            factory = new ViewFactory(validSource.name, template, this.lifecycle);
            factory.setCacheSize(validSource.cache, true);
            this.viewFactoryLookup.set(definition, factory);
        }
        return factory;
    }
    templateFromSource(dom, definition, parentContext, componentType) {
        if (parentContext == void 0) {
            parentContext = this.container;
        }
        if (definition.template != void 0) {
            const renderContext = createRenderContext(dom, parentContext, definition.dependencies, componentType);
            if (definition.build.required) {
                const compilerName = definition.build.compiler || defaultCompilerName;
                const compiler = this.compilers[compilerName];
                if (compiler === undefined) {
                    throw Reporter.error(20, compilerName);
                }
                definition = compiler.compile(dom, definition, new RuntimeCompilationResources(renderContext), ViewCompileFlags.surrogate);
            }
            return this.templateFactory.create(renderContext, definition);
        }
        return noViewTemplate;
    }
}
RenderingEngine.inject = [IContainer, ITemplateFactory, ILifecycle, all(ITemplateCompiler)];
export function createRenderContext(dom, parent, dependencies, componentType) {
    const context = parent.createChild();
    const renderableProvider = new InstanceProvider();
    const elementProvider = new InstanceProvider();
    const instructionProvider = new InstanceProvider();
    const factoryProvider = new ViewFactoryProvider();
    const renderLocationProvider = new InstanceProvider();
    const renderer = context.get(IRenderer);
    dom.registerElementResolver(context, elementProvider);
    context.registerResolver(IViewFactory, factoryProvider);
    context.registerResolver(IController, renderableProvider);
    context.registerResolver(ITargetedInstruction, instructionProvider);
    context.registerResolver(IRenderLocation, renderLocationProvider);
    if (dependencies != void 0) {
        context.register(...dependencies);
    }
    //If the element has a view, support Recursive Components by adding self to own view template container.
    if (componentType) {
        componentType.register(context);
    }
    context.render = function (flags, renderable, targets, templateDefinition, host, parts) {
        renderer.render(flags, dom, this, renderable, targets, templateDefinition, host, parts);
    };
    // @ts-ignore
    context.beginComponentOperation = function (renderable, target, instruction, factory, parts, location) {
        renderableProvider.prepare(renderable);
        elementProvider.prepare(target);
        instructionProvider.prepare(instruction);
        if (factory) {
            factoryProvider.prepare(factory, parts);
        }
        if (location) {
            renderLocationProvider.prepare(location);
        }
        return context;
    };
    context.dispose = function () {
        factoryProvider.dispose();
        renderableProvider.dispose();
        instructionProvider.dispose();
        elementProvider.dispose();
        renderLocationProvider.dispose();
    };
    return context;
}
/** @internal */
export class ViewFactoryProvider {
    prepare(factory, parts) {
        this.factory = factory;
        factory.addParts(parts);
    }
    resolve(handler, requestor) {
        const factory = this.factory;
        if (factory == null) { // unmet precondition: call prepare
            throw Reporter.error(50); // TODO: organize error codes
        }
        if (!factory.name || !factory.name.length) { // unmet invariant: factory must have a name
            throw Reporter.error(51); // TODO: organize error codes
        }
        const found = factory.parts[factory.name];
        if (found) {
            const renderingEngine = handler.get(IRenderingEngine);
            const dom = handler.get(IDOM);
            return renderingEngine.getViewFactory(dom, found, requestor);
        }
        return factory;
    }
    dispose() {
        this.factory = null;
    }
}
/** @internal */
let ChildrenObserver = ChildrenObserver_1 = class ChildrenObserver {
    constructor(controller, viewModel, flags, propertyName, cbName, query = defaultChildQuery, filter = defaultChildFilter, map = defaultChildMap, options) {
        this.propertyKey = propertyName;
        this.obj = viewModel;
        this.callback = viewModel[cbName];
        this.query = query;
        this.filter = filter;
        this.map = map;
        this.options = options;
        this.children = (void 0);
        this.controller = controller;
        this.observing = false;
        this.persistentFlags = flags & 2013265935 /* persistentBindingFlags */;
        this.createGetterSetter();
    }
    getValue() {
        this.tryStartObserving();
        return this.children;
    }
    setValue(newValue) { }
    subscribe(subscriber) {
        this.tryStartObserving();
        this.addSubscriber(subscriber);
    }
    tryStartObserving() {
        if (!this.observing) {
            this.observing = true;
            const projector = this.controller.projector;
            this.children = filterChildren(projector, this.query, this.filter, this.map);
            projector.subscribeToChildrenChange(() => { this.onChildrenChanged(); }, this.options);
        }
    }
    onChildrenChanged() {
        this.children = filterChildren(this.controller.projector, this.query, this.filter, this.map);
        if (this.callback !== void 0) {
            this.callback.call(this.obj);
        }
        this.callSubscribers(this.children, undefined, this.persistentFlags | 16 /* updateTargetInstance */);
    }
    createGetterSetter() {
        if (!Reflect.defineProperty(this.obj, this.propertyKey, {
            enumerable: true,
            configurable: true,
            get: () => this.getValue(),
            set: () => { },
        })) {
            Reporter.write(1, this.propertyKey, this.obj);
        }
    }
};
ChildrenObserver = ChildrenObserver_1 = tslib_1.__decorate([
    subscriberCollection()
], ChildrenObserver);
export { ChildrenObserver };
/** @internal */
export function filterChildren(projector, query, filter, map) {
    const nodes = query(projector);
    const children = [];
    for (let i = 0, ii = nodes.length; i < ii; ++i) {
        const node = nodes[i];
        const controller = CustomElement.behaviorFor(node);
        const viewModel = controller ? controller.viewModel : null;
        if (filter(node, controller, viewModel)) {
            children.push(map(node, controller, viewModel));
        }
    }
    return children;
}
function defaultChildQuery(projector) {
    return projector.children;
}
function defaultChildFilter(node, controller, viewModel) {
    return !!viewModel;
}
function defaultChildMap(node, controller, viewModel) {
    return viewModel;
}
//# sourceMappingURL=rendering-engine.js.map