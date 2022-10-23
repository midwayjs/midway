# Common TS questions


TS has many compilation static checks, such as inconsistent types and undefined objects, which are the best by default. It is hoped that users can reasonably consider coding styles and habits, switch configurations carefully, and enjoy the benefits of TS static checks.


## Dependency package definition error


If the TS version of the dependency package and the project itself are inconsistent, an error will occur at compile time.


You can turn off dependency package checking at `tsconfig.json`.

```typescript
{
  "compilerOptions": {
    "skipLibCheck": true
  },
}
```


## TS2564 initialization unassigned error


The error is as follows:

```yaml
error TS2564: Property 'name' has no initializer and is not definitely assigned in the constructor.
```
The reason is that the initialization attribute check of TS is enabled. If there is no initialization assignment, an error will be reported.


Treatment method:


The first: remove the check rule of tsconfig.json

```json
{
  "strictPropertyInitialization": false // or remove
}
```

The second type: attribute plus exclamation mark

```typescript
export class HomeController {
  @Inject()
  userService! : UserService;
}
```


## TS6133 Object Declaration Not Used Error


The error is as follows:
```yaml
error TS6133: 'app' is declared but its value is never read.
```
The reason is that the object with TS turned on is not checked. If it is declared but not used, an error will be reported.


Treatment method:


The first: remove undefined variables


The second: remove tsconfig.json's inspection rules
```json
{
  "compilerOptions": {
    "noUnusedLocals": false
  },
}
```


## The typings defined in the tsconfig does not take effect


In tsconfig.json, if the typeRoots is defined and the include is defined, if the include does not contain the content in the typeRoot, an error will be reported in dev/build.


This is a ts/ts-node problem. For issue, see [#782](https://github.com/TypeStrong/ts-node/issues/782) and [#22217](https://github.com/microsoft/TypeScript/issues/22217).


For example:
```json
"typeRoots": [
  "./node_modules/@types ",
  "./typings"
],
"include": [
  "src ",
  "typings"
],
"exclude": [
  "dist ",
  "node_modules"
],
```
As mentioned above, if the typings is not written in the include, the definition cannot be found in dev/build and an error will be reported.
