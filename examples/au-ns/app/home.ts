import { INode, customElement } from '@aurelia/runtime';
import { Page, Frame, EventData, GestureEventData } from '@nativescript/core';
import template from './home.html';


@customElement({ name: 'home', template })
export default class Home extends Page {
  static inject = [INode];

  count = 0;
  max = 42;
  
  constructor() {
    super();
    // if (!(view instanceof Page)) {
    //   // throw new Error('DI should work beautifully');
    // }
  }

  onTap(e: GestureEventData) {
    this.count = Math.min(this.count + 1, this.max);
  }
  
}