// import * as app from "tns-core-modules/application";
import { Aurelia, RuntimeNsConfiguration } from '@aurelia/runtime-nativescript'

// app.run({ moduleName: "app-root" });
import { DI } from '@aurelia/kernel';
import { CustomElement, INode } from '@aurelia/runtime';
import { DebugConfiguration } from '@aurelia/debug';
import { Page, EventData, GestureEventData } from '@nativescript/core';
import { JitNsConfiguration } from '@aurelia/jit-nativescript';

try {
  new Aurelia()
    .register(
      RuntimeNsConfiguration,
      DebugConfiguration,
      JitNsConfiguration,
    )
    .app({
      host: new Page(),
      component: CustomElement.define({
        name: 'MyApp',
        template:
          `<StackLayout orientation="vertical" width="400" height="410" backgroundColor="lightgray">
            <Progress
              class="progress"
              width="100%"
              height="40"
              value.bind="count"
              maxValue.bind="max"
              color="#ed2b88"
            />
            <Label width="100%" text="You have clicked \${count} time(s)" />
            <Button text="Click me \${42 - count} more time(s)" tap.trigger="onTap($event)" />
          </StackLayout>`
      }, class App {

        static inject = [INode];

        count = 0;
        max = 42;
        
        constructor(view: Page) {
          if (!(view instanceof Page)) {
            throw new Error('DI should work beautifully');
          }
        }

        onTap(e: GestureEventData) {
          this.count = Math.min(this.count + 1, this.max);
        }
      })
    })
    .start();
} catch (ex) {
  console.error(ex);
  debugger;
  throw ex;
}
/*
Do not place any code after the application has been started as it will not
be executed on iOS.
*/
