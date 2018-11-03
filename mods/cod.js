// naming - useful for simpler utils:
const methodz = require("./lib.js");

// TREE SHAKING(kindof):
const { methodUnit, methodUnit2 } = require("./lib2.js");

console.log("Utils: " + methodz);
const m1 = methodz.someMethod("Wun");
console.log(m1);
const m2 = methodz.otherMethod("Wun");
console.log(m2);

console.log("Unit1: " + methodUnit);
const mUnit = methodUnit("Wun");
console.log(mUnit);
console.log(mUnit.someMethod("Wun"));
console.log("Unit2: " + methodUnit2);
const mUnit2 = methodUnit2("Wun");
console.log(mUnit2);
console.log(mUnit2.valueOf());
