import {
  AnySymbol as $AnySymbol,
  BindingSymbol,
  CustomAttributeSymbol,
  CustomElementSymbol as $CustomElementSymbol,
  ElementSymbol as $ElementSymbol,
  LetElementSymbol as $LetElementSymbol,
  NodeSymbol as $NodeSymbol,
  ParentNodeSymbol as $ParentNodeSymbol,
  PlainAttributeSymbol,
  PlainElementSymbol as $PlainElementSymbol,
  ReplacePartSymbol as $ReplacePartSymbol,
  ResourceAttributeSymbol as $ResourceAttributeSymbol,
  SymbolWithBindings as $SymbolWithBindings,
  SymbolWithMarker as $SymbolWithMarker,
  SymbolWithTemplate as $SymbolWithTemplate,
  TemplateControllerSymbol as $TemplateControllerSymbol,
  TextSymbol as $TextSymbol,
} from '@aurelia/jit';

import { NsNode } from '@aurelia/runtime-nativescript';

export type AnySymbol = $AnySymbol<NsNode, NsNode, NsNode>;
export type ElementSymbol = $ElementSymbol<NsNode, NsNode, NsNode>;
export type NodeSymbol = $NodeSymbol<NsNode, NsNode, NsNode>;
export type ParentNodeSymbol = $ParentNodeSymbol<NsNode, NsNode, NsNode>;
export type ResourceAttributeSymbol = $ResourceAttributeSymbol<NsNode, NsNode, NsNode>;
export type SymbolWithBindings = $SymbolWithBindings<NsNode, NsNode, NsNode>;
export type SymbolWithMarker = $SymbolWithMarker<NsNode, NsNode, NsNode>;
export type SymbolWithTemplate = $SymbolWithTemplate<NsNode, NsNode, NsNode>;

declare class $$CustomElementSymbol extends $CustomElementSymbol<NsNode, NsNode, NsNode> {}
declare class $$LetElementSymbol extends $LetElementSymbol<NsNode, NsNode> {}
declare class $$PlainElementSymbol extends $PlainElementSymbol<NsNode, NsNode, NsNode> {}
declare class $$ReplacePartSymbol extends $ReplacePartSymbol<NsNode, NsNode, NsNode> {}
declare class $$TemplateControllerSymbol extends $TemplateControllerSymbol<NsNode, NsNode, NsNode> {}
declare class $$TextSymbol extends $TextSymbol<NsNode, NsNode> {}

export const CustomElementSymbol = $CustomElementSymbol as typeof $$CustomElementSymbol;
export const LetElementSymbol = $LetElementSymbol as typeof $$LetElementSymbol;
export const PlainElementSymbol = $PlainElementSymbol as typeof $$PlainElementSymbol;
export const ReplacePartSymbol = $ReplacePartSymbol as typeof $$ReplacePartSymbol;
export const TemplateControllerSymbol = $TemplateControllerSymbol as typeof $$TemplateControllerSymbol;
export const TextSymbol = $TextSymbol as typeof $$TextSymbol;

export interface CustomElementSymbol extends $$CustomElementSymbol {}
export interface LetElementSymbol extends $$LetElementSymbol {}
export interface PlainElementSymbol extends $$PlainElementSymbol {}
export interface ReplacePartSymbol extends $$ReplacePartSymbol {}
export interface TemplateControllerSymbol extends $$TemplateControllerSymbol {}
export interface TextSymbol extends $$TextSymbol {}

export {
  BindingSymbol,
  CustomAttributeSymbol,
  PlainAttributeSymbol,
};
