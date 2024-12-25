# How to install Node.js environment

## Use scenario

Generally, you can download the corresponding installation package from the [Node.js official website](https://nodejs.org/) to complete the environment configuration.

However, when you **develop on-premises**, you often need to quickly update or switch the version.

The community has solutions such as [nvm](https://github.com/creationix/nvm), [n](https://github.com/tj/n), etc. We recommend cross-platform [nvs](https:/ /github.com/jasongin/nvs).

- nvs is cross-platform.
- Nvs is written based on Node, and we can participate in maintenance.



> Friendly reminder: both Node 12.x and 14.x run into EOL. please upgrade to 16 or 18 as soon as possible.
> [https://github.com/nodejs/Release](https://github.com/nodejs/Release)



**PS:nvs is generally only used for local development. For more information, see** [Popular text: What should I do if O & M does not upgrade the Node version?](https://zhuanlan.zhihu.com/p/39226941)

---

## How to install

### Linux / macOS environment

The project corresponding to Git Clone can be used.

```bash
$ export NVS_HOME="$HOME/.nvs"
$ git clone https://github.com/jasongin/nvs --depth=1 "$NVS_HOME"
$ . "$NVS_HOME/nvs.sh" install
```

### Windows environment

Due to the complexity of Windows environment configuration, it is recommended to use `msi` file to complete initialization.
Visit [nvs/releases](https://github.com/jasongin/nvs/releases) to download the latest version of `nvs.msi`, and then double-click to install.

---

## Configure mirror address
In China, due to reasons that everyone knows, it is necessary to modify the corresponding mirror address:
```bash
$ nvs remote node https://npmmirror.com/mirrors/node/
$ nvs remote
default             node
chakracore          https://github.com/nodejs/node-chakracore/releases/
chakracore-nightly  https://nodejs.org/download/chakracore-nightly/
nightly             https://nodejs.org/download/nightly/
node                https://nodejs.org/dist/
```

---

## Guidelines for Use
With the following command, you can easily install the latest LTS version of Node.js.
```bash
# Install the latest LTS version
$ nvs add lts
# Configure as default version
$ nvs link lts
```
Install other versions:
```bash
# Install other versions and try them
$ nvs add 12
# View installed versions
$ nvs ls
# Switch version at current Shell
$ nvs use 12
```
For more information, see `nvs --help`.

---

## Common npm global module
If you use `nvs`, the default `prefix` is the installation path of the currently activated Node.js version.
One problem is that after switching versions, the previous installation of the global command module needs to be reinstalled, which is very inconvenient.
The solution is to configure a unified global module installation path to `~/.npm-global`, as follows:
```bash
$ mkdir -p ~/.npm-global
$ npm config set prefix ~/.npm-global
```
You must also configure environment variables in the `~/.bashrc` or `~/.zshrc` file:
```bash
$ echo "export PATH=~/.npm-global/bin:$PATH" >> ~/.zshrc
$ source ~/.zshrc
```

---



## Mac Silicon chips use lower versions of Node.js

If you are using an Apple chip, since there is no chip support build for arm64 below Node.js 16, it cannot be installed directly.

Fortunately, there are workarounds to get Node.js 14 to work with Mac Silicon. Apple offers Rosetta, a translation app that allows apps built for Intel chips (or previous-generation Macs) to run under Apple Silicon.

There are two steps:

* 1. Install Rosetta
* 2. Switch to the intel environment and install a lower version of Node.js



**Install Rosetta**

Open the terminal and execute

```bash
$ /usr/sbin/softwareupdate --install-rosetta --agree-to-license
```



**Switch the environment and install a lower version of Node.js**

* 1. Open the terminal, execute `arch`, and confirm that the running is `arm64`
* 2. Execute `arch -x86_64 zsh` to open a new terminal
* 3. Execute `arch` to confirm that the running is `i386`
* 4. Install a lower version of Node.js, you can use the nvs or nvm mentioned above to install



## Related reading

- [Popular text: Node.js security attack and defense-how to forge and obtain a user's real IP address?](https://zhuanlan.zhihu.com/p/62265144)
- [Popular text: What if O & M does not upgrade the Node version?](https://zhuanlan.zhihu.com/p/39226941)
- [Popular Science: Why can't you use npm install on the server?](https://zhuanlan.zhihu.com/p/39209596)
- [Using NodeJs 14 with Mac Silicon (M1)](https://devzilla.io/using-nodejs-14-with-mac-silicon-m1)
