import { CreatePlugin } from '../src';

export class TestCreatePlugin extends CreatePlugin {
  // showPrompt = false;
  promptAction;

  mockPrompt(arr) {
    this.promptAction = arr;
  }

  async beforePromptSubmit() {
    this.prompt.once('prompt', async () => {
      const value = this.promptAction.shift();
      if (value) {
        for (const flag of value) {
          if (Array.isArray(flag)) {
            await this.prompt.keypress(...flag);
          } else if (typeof flag === 'string') {
            try {
              for (const key of flag.split('')) {
                await this.prompt.keypress(key);
              }
            } catch (err) {
              console.error(err);
            }
          }
        }
      }

      await this.prompt.submit();
      this.prompt.close();
    });
  }
}
