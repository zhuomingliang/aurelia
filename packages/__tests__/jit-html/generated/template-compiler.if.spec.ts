// tslint:disable:quotemark member-access no-all-duplicated-branches
import { Profiler } from "@aurelia/kernel";
import { Aurelia, CustomElementResource } from "@aurelia/runtime";
import { TestContext, writeProfilerReport, assert, h } from "@aurelia/testing";

describe.only("generated.template-compiler.if", function () {
    function setup() {
        const ctx = TestContext.createHTMLTestContext();
        const au = new Aurelia(ctx.container);
        const host = ctx.createElement("div");
        return { au, host };
    }

    it("10 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define(
          {
            name: "app",
            template: `<div if.bind="show">if</div><div else>else</div>`
          },
          class {
            show = true;
          }
        );
        const component = new App();
        au.app({ host, component });
        au.start();
        assert.strictEqual(host.textContent, 'if');
        component.show = false;
        assert.strictEqual(host.textContent, 'else');
    });

    it("10 _", function () {
      const { au, host } = setup();
      const App = CustomElementResource.define(
        {
          name: "app",
          template: `<div if.bind="show">if</div><div else>else</div>`
        },
        class {
          show = false;
        }
      );
      const component = new App();
      au.app({ host, component });
      au.start();
      assert.strictEqual(host.textContent, 'else');
      component.show = true;
      assert.strictEqual(host.textContent, 'if');
  });
});
