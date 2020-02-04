import { INode, customElement } from '@aurelia/runtime';
import { Page, Frame, EventData, GestureEventData } from '@nativescript/core';
import template from './home.html';

@customElement({ name: 'home', template })
export default class Home {
  static inject = [INode];

  count = 0;
  max = 42;

  constructor(private page: Page) {

  }

  onTap(e: GestureEventData) {
    this.count = Math.min(this.count + 1, this.max);
  }

  onTapReverse() {
    this.count = Math.max(this.count - 1, 0);
  }

  goBack() {
    this.page.frame.goBack();
  }
}
