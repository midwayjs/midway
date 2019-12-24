const minimist = require('minimist');
const CoreClass = require('@midwayjs/command-core');
const { transform } = require('@midwayjs/spec-builder');
const { existsSync } = require('fs');
const { join } = require('path');
const baseDir = process.cwd();
class Cli {
    constructor(argv) {
        this.argv = minimist(argv.slice(2));
        this.loadSpec();
        this.providerName = this.spec.provider && this.spec.provider.name || '';
        this.core = new CoreClass({
            config: {
                servicePath: baseDir
            },
            commands: this.argv._,
            service: this.spec,
            provider: this.providerName,
            options: this.argv,
            log: console,
        });
        this.loadDefaultPlugin();
        this.loadUserPlugin();
    }

    loadDefaultPlugin() {
        this.core.addPlugin(`npm::serverless-midway-plugin`);
    }

    loadSpec() {
        const specPath = ['f.yml', 'f.yaml', 'serverless.yml', 'serverless.yaml'].find(spec => existsSync(join(baseDir, spec)));
        if (!specPath) {
            this.error('need f.yml');
        }
        this.spec = transform(specPath);
    }

    error(errMsg) {
        console.log('errMsg', errMsg);
        process.exit(1);
    }

    loadUserPlugin() {
        if (!this.spec || !this.spec.plugins) {
            return;
        }
        for(const plugin of this.spec.plugins) {
            if (/^npm:/.test(plugin) || /^local:/.test(plugin)) {
                this.core.addPlugin(plugin);
            } else if (/^\./.test(plugin)) {
                this.core.addPlugin(`local:${this.providerName}:${plugin}`);
            } else {
                const localPlugin = this.loadRelativePlugin('.serverless_plugins', plugin);
                if (!localPlugin) {
                    this.loadRelativePlugin('node_modules', plugin);
                }
            }
        }
    }

    loadRelativePlugin(dirPath, path) {
        try {
            const localPlugin = require(join(baseDir, dirPath, path));
            this.core.addPlugin(localPlugin);
            return true;
        } catch(e) {
            return false;
        }
    }

    async start() {
        await this.core.ready();
        await this.core.invoke(this.argv._);
    }
}
module.exports = Cli;