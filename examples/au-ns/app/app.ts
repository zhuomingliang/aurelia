import { INode, CustomElement } from '@aurelia/runtime';
import { Page, Frame, EventData, GestureEventData } from '@nativescript/core';
import Home from './home';

export default class App {
  static inject = [INode];

  constructor(view: Page) {
    if (!(view instanceof Page)) {
      throw new Error('DI should work beautifully');
    }
  }

  onTap(e: GestureEventData) {
    const frame = Frame.topmost();
    frame.navigate({ create:  () => new Home() });

  }

}
