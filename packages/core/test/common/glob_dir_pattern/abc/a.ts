import { Provide } from '../../../../src';

console.log('a');

@Provide()
export class A {}

@Provide()
export class B {}

@Provide()
export class C {}

