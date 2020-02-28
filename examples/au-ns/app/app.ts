import { INode } from '@aurelia/runtime';
import { IViewComposer } from '@aurelia/runtime-nativescript';
import { Page, Frame, EventData, GestureEventData, Button } from '@nativescript/core';
import Home from './home';
import { inject } from '@aurelia/kernel';

@inject(INode, IViewComposer)
export default class App {

  tabs: any[] = [
    { tab: 'Home' },
    { tab: 'Contact' },
    { tab: 'Details' }
  ]

  contacts = [
    { name: 'Andrea' },
    { name: 'Patria' },
    { name: 'Kiri' },
    { name: 'Andrew' },
    { name: 'Samuel' },
    { name: 'Pixi' },
    { name: 'Andrew' },
    { name: 'Samuel' },
    { name: 'Pixi' },
    { name: 'Andrew' },
    { name: 'Samuel' },
    { name: 'Pixi' },
    { name: 'Andrew' },
    { name: 'Samuel' },
    { name: 'Pixi' },
    { name: 'Andrew' },
    { name: 'Samuel' },
    { name: 'Pixi' },
    { name: 'Andrew' },
    { name: 'Samuel' },
    { name: 'Pixi' },
    { name: 'Andrew' },
    { name: 'Samuel' },
    { name: 'Pixi' },
    { name: 'Andrew' },
    { name: 'Samuel' },
    { name: 'Pixi' },
  ]

  constructor(
    private readonly view: Page,
    private readonly viewComposer: IViewComposer
  ) {
    if (!(view instanceof Page)) {
      throw new Error('DI should work beautifully');
    }
    debugger;
  }

  onTap(e: GestureEventData) {
    const frame = this.view.frame;
    frame.navigate({
      create:  () => this.viewComposer.compose(Home, Page)
    });
  }
}
