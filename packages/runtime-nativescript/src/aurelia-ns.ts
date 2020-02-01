import {
  Aurelia as $RuntimeAurelia,
  CompositionRoot,
  ILifecycleTask,
  ISinglePageApp
} from '@aurelia/runtime';
import {
  Application,
  Frame,
  Page
} from '@nativescript/core';
import {
  NsView
} from './dom';

export class Aurelia extends $RuntimeAurelia {
  public app(config: ISinglePageApp<Page | Frame>): Omit<this, 'register' | 'app'> {
    const host = config.host;
    if (host === void 0) {
      config.host = new Page();
    }
    return super.app(config);
  }

  public start(root: CompositionRoot<NsView> | undefined = this['next']): ILifecycleTask {
    const start = super.start();
    Application.run({
      create: () => {
        return root.host;
      }
    });
    // any thing after application.run won't be executed on IOS
    // so it won't return
    return start;
  }
}
