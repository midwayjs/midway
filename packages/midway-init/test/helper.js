'use strict';

const Command = require('../lib/command');

class TestCommand extends Command {

  constructor() {
    super();
    this.showPrompt = false;
  }

  mockPrompt(arr) {
    this.promptAction = arr;
  }

  async beforePromptSubmit() {
    this.prompt.once('run', async () => {
      const value = this.promptAction.shift();
      if (value) {
        for (const flag of value) {
          if (Array.isArray(flag)) {
            await this.prompt.keypress.apply(this.prompt, flag);
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

exports.TestCommand = TestCommand;
