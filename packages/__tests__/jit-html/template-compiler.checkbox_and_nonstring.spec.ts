import {
  Aurelia,
  CustomElement,
} from '@aurelia/runtime';
import {
  assert,
  HTMLTestContext,
  TestContext
} from '@aurelia/testing';


describe('template-compiler.checkbox_and_nonstring.spec.ts', function() {
  
  interface ICheckboxWithNonStringValueTestCase {
    title: string;
    template: string;
    root?: any;
    assertFn: <T = any>(ctx: HTMLTestContext, host: HTMLElement, comp: T) => void;
  }

  interface ITestModel {
    id: number;
    name: string;
  }

  const testCases: ICheckboxWithNonStringValueTestCase[] = [
    {
      title: 'works in basic scenario (model comes before checked binding)',
      template:
        `<form>
          <h3>Products</h3>
          <label>
            <input
              type="checkbox"
              model.bind="{ id: 0, name: 'Motherboard' }"
              matcher.bind="productMatcher"
              checked.bind="selectedProducts">
            Motherboard
          </label>
          <label>
            <input
              type="checkbox"
              model.bind="{ id: 1, name: 'CPU' }"
              matcher.bind="productMatcher"
              checked.bind="selectedProducts">
            CPU
          </label>
          <label>
            <input
              type="checkbox"
              model.bind="{ id: 2, name: 'Memory' }"
              matcher.bind="productMatcher"
              checked.bind="selectedProducts">
            Memory
          </label>

          <h3>Data</h3>
          <ul>
            <li repeat.for="product of selectedProducts">
              \${product.id} - \${product.name}
            </li>
          </ul>
        </form>`,
      root: class App {
        selectedProducts: ITestModel[] = [{ id: 1, name: "CPU" }, { id: 2, name: "Memory" }];
      
        productMatcher = (a: ITestModel, b: ITestModel) => a.id === b.id;
      },      
      assertFn: (ctx, host, comp) => {
        const checkboxEls = Array.from(host.querySelectorAll('input[type=checkbox]')) as HTMLInputElement[];
        assert.strictEqual(checkboxEls.length, 3);
        assert.strictEqual(checkboxEls.filter(checkbox => checkbox.checked).length, 2);
      }
    },
    {
      title: 'works in basic scenario (model comes after checked binding)',
      template:
        `<form>
          <h3>Products</h3>
          <label>
            <input
              type="checkbox"
              checked.bind="selectedProducts"
              model.bind="{ id: 0, name: 'Motherboard' }"
              matcher.bind="productMatcher">
            Motherboard
          </label>
          <label>
            <input
              type="checkbox"
              checked.bind="selectedProducts"
              model.bind="{ id: 1, name: 'CPU' }"
              matcher.bind="productMatcher">
            CPU
          </label>
          <label>
            <input
              type="checkbox"
              checked.bind="selectedProducts"
              model.bind="{ id: 2, name: 'Memory' }"
              matcher.bind="productMatcher">
            Memory
          </label>

          <h3>Data</h3>
          <ul>
            <li repeat.for="product of selectedProducts">
              \${product.id} - \${product.name}
            </li>
          </ul>
        </form>`,
      root: class App {
        selectedProducts: ITestModel[] = [{ id: 1, name: "CPU" }, { id: 2, name: "Memory" }];
      
        productMatcher = (a: ITestModel, b: ITestModel) => a.id === b.id;
      },      
      assertFn: (ctx, host, comp) => {
        const checkboxEls = Array.from(host.querySelectorAll('input[type=checkbox]')) as HTMLInputElement[];
        assert.strictEqual(checkboxEls.length, 3);
        assert.strictEqual(checkboxEls.filter(checkbox => checkbox.checked).length, 2);
      }
    }
  ];

  for (const testCase of testCases) {
    const {
      title,
      template,
      root,
      assertFn,
    } = testCase;

    it(title, async function() {
      let host: HTMLElement;
      try {
        const ctx = TestContext.createHTMLTestContext();
        const aurelia = new Aurelia(ctx.container);
        host = ctx.createElement('app');

        const Root = root !== undefined && CustomElement.isType(root)
          ? root
          : CustomElement.define({ name: 'app', template }, root);

        aurelia.app({ host, component: Root });
        aurelia.start();

        await assertFn(ctx, host, aurelia.container.get(Root));

      } finally {
        if (host !== undefined) {
          host.remove();
        }
      }
    });
  }
});
