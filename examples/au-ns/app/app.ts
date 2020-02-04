import { INode } from '@aurelia/runtime';
import { IViewComposer } from '@aurelia/runtime-nativescript';
import { Page, Frame, EventData, GestureEventData, Button } from '@nativescript/core';
import Home from './home';
import { inject } from '@aurelia/kernel';

@inject(INode, IViewComposer)
export default class App {

  constructor(
    private readonly view: Page,
    private readonly viewComposer: IViewComposer
  ) {
    if (!(view instanceof Page)) {
      throw new Error('DI should work beautifully');
    }
  }

  onTap(e: GestureEventData) {
    const frame = this.view.frame;
    frame.navigate({
      create:  () => {
        try {
          const page = this.viewComposer.compose(Home, Page);
          page.id = 'Some___ID';
          return page;
        } catch (ex) {
          console.error(ex);
          throw ex;
        }
      }
    });
  }
}
