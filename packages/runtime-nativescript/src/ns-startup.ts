import { Application, Page, Frame } from '@nativescript/core';

Application.run({
  create: () => {
    return new Page();
  }
});

// activator should call application.run
// new Frame().page.content
