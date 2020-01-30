import {
  Aurelia as $RuntimeAurelia,
  ISinglePageApp,
  CompositionRoot,
  ILifecycleTask,
} from '@aurelia/runtime';
import {
  NsNode
} from './runtime';
import {
  Application
} from '@nativescript/core';

export class Aurelia extends $RuntimeAurelia {
  public app(config: ISinglePageApp<NsNode>): Omit<this, 'register' | 'app'> {
    const host = config.host;
    if (host === void 0) {
      const node = config.host = new NsNode('Page');
      node.createNsView();
    }
    return super.app(config);
  }

  public start(root: CompositionRoot<NsNode> | undefined = this['next']): ILifecycleTask {
    const start = super.start();
    Application.run({
      create: () => {
        return root.host.view!;
      }
    });
    // any thing after application.run won't be executed on IOS
    // so it won't return
    return start;
  }
}
