/* eslint-disable @typescript-eslint/no-var-requires, import/no-extraneous-dependencies, @typescript-eslint/no-require-imports */
import * as test from 'tape'

import * as config from '../base.js'


interface User {
  name: string
  age: number
}

export const userA: User = {
  name: 'foo',
  age: 1,
}
export const userB = {
  name: 'foo',
} as User

export function isObject(obj: unknown): boolean {
  return !! (typeof obj === 'object' && obj)
}

export function isString(input: string): boolean {
  return typeof input === 'string'
}

export function isArray(input: readonly unknown[]): boolean {
  return Array.isArray(input)
}


export {
  test,
  config,
}


export const foo = { foo: 3 }

export const bar = async (): Promise<number> => 1
const barz = () => 1
barz

const promise = new Promise(done => done('value'))
promise.catch(console.error)



// regular property with function type
export interface T2 {
  func: (arg: string) => number
}

export class ClassFoo {

  private age: number

  constructor(private name: string) {
    this.age = 1
  }

  foo(): void {
    this.name = 'foo'
    this.age = 2
    return
  }

}

'' + JSON.stringify({})

export function myFunc(input: string | null): string {
  return input ?? 'a string'
}


interface BaseConfig {
  multiline?: {
    delimiter?: 'none' | 'semi' | 'comma',
    requireLast?: boolean,
  }
  singleline?: {
    delimiter?: 'semi' | 'comma',
    requireLast?: boolean,
  }
}
type Config = BaseConfig & {
  overrides?: {
    interface?: BaseConfig,
    typeLiteral?: BaseConfig,
  },
  foo: {
    name: string,
    age: number,
  },
}
type Config2 = BaseConfig & {
  foo: string,
  age: number,
}

// @ts-expect-error
export const str2: string = 1

export function x<R extends Record<string, (this: unknown) => unknown>>(fns: R): unknown {
  return fns
}


// export const fullPath = __dirname + '/foo.js'
// console.log(test, config)
// export const userA1:User = {
//   name: 'foo',
//   age: 1,
// }
// export const userC = <User> {
//   name: 'bar',
//   age: 2,
// }

// function test() {
//   return
// }
// test()

// // method shorthand syntax
// export interface T1 {
//   func(arg: string): number
// }

// '' + {}
// '' + {}.toString()

// export function isArray2(input: unknown[]): boolean {
//   return Array.isArray(input)
// }

// type Day =
//   | 'Monday'
//   | 'Tuesday'
//   | 'Wednesday'
//   | 'Thursday'
//   | 'Friday'
//   | 'Saturday'
//   | 'Sunday'
// const day = 'Monday' as Day
// let result = 0
// switch (day) {
//   case 'Monday': {
//     result = 1
//     break
//   }
// }
// export const ret = result

// setTimeout('alert("Hi!");', 100)
// const promise2 = Promise.resolve('value')
// if (promise2) {
//   // Do something
// }

