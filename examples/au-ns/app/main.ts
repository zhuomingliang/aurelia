import { Aurelia, RuntimeNsConfiguration } from '@aurelia/runtime-nativescript'
import { CustomElement } from '@aurelia/runtime';
import { DebugConfiguration } from '@aurelia/debug';
import { Page, Frame } from '@nativescript/core';
import { JitNsConfiguration } from '@aurelia/jit-nativescript';

import App from './app';
import template from './app.html';

debugger;
try {
  new Aurelia()
    .register(
      RuntimeNsConfiguration,
      DebugConfiguration,
      JitNsConfiguration,
    )
    .app({
      host: null!, // new Page(),
      component: CustomElement.define({
        name: 'MyApp',
        template
      }, App)
    })
    .start();
} catch (ex) {
  console.error(ex);
  debugger;
  throw ex;
}
