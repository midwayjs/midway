// import { isAsyncFunction } from '../util';
//
// export function OnUndefined(data: Error | number) {
//   return (target, key, descriptor: PropertyDescriptor) => {
//     const oldMethod = descriptor.value;
//     if (isAsyncFunction(oldMethod)) {
//       descriptor.value = async (...args) => {
//         const result = await oldMethod(...args);
//         if(typeof result === 'undefined') {
//
//         }
//       };
//     } else {
//       descriptor.value = () => {
//
//       };
//     }
//
//     return descriptor;
//   };
// }
//
// export function OnNull(data: Error | number) {
//   return (target, key, descriptor: PropertyDescriptor) => {
//
//     return descriptor;
//   };
// }
//
// export function OnEmpty(data: Error | number) {
//   return (target, key, descriptor: PropertyDescriptor) => {
//
//     return descriptor;
//   };
// }
