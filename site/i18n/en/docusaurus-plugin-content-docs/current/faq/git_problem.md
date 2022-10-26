# Common git problems

## File name case problem


Because git is not sensitive to case by default, if the file name is changed from small to uppercase, the file cannot be found to be changed and not submitted to the warehouse.


What's more frightening is that mac is also case-insensitive, and it often happens that it can run locally and execute errors when it goes to the server.


For this reason, we 'd better turn off the default case of git.


The following command.

```bash
$ git config core.ignorecase false ## takes effect for the current project
$ git config --global --add core.ignorecase false ## takes effect globally
```


## Line wrapping problem under windows


When creating or cloning code on the Windows, developing or submitting code, the following errors may occur:

```
Delete '␍'eslint(prettier/prettier)
```

The reasons are as follows:


Due to historical reasons, the line breaks of text files under windows and linux are inconsistent.


- Windows use both the carriage return CR(carriage-return character) and the line feed LF(linefeed character) when wrapping lines.
- Mac and Linux systems, on the other hand, use only the line break LF.
- The old version of the Mac system used the carriage return CR.




| Windows | Linux/Mac | Old Mac(pre-OSX |
| --- | --- | --- |
| CRLF | LF | CR |
| '\n\r' | '\n' | '\r' |

Therefore, incompatibility problems occur when text files are created and used under different systems.


The solution is as follows:


Set global git text line breaks
```bash
$ git config --global core.autocrlf false
```
Note: After git global configuration, you need to pull the code again.

If you are using the vscode editor, the solution is as follows:


In the lower-right corner of the editor, manually change `CRLF` to `LF`

This method can only modify the line break of the current file, using vscode to create a new file line break is also `CRLF`, you can add the following configuration in `settings.json`

```
"files.eol": "\n",
```


Reference:

- [Delete `␍` eslint(prettier/prettier) Error Solution](https://juejin.cn/post/6844904069304156168)
- [Configure a Git processing line terminator](https://docs.github.com/cn/github/getting-started-with-github/configuring-git-to-handle-line-endings)
