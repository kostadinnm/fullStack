
// import fs from "fs";
// const rfs = fs.readFileSync;
// console.log(rfs);

export function dumdb() {
    return "It's a function";
}

function myFunction() {
    return "It's an additional function";
}
function myFunction2() {
    return "It's an additional second function";
}

export default Object.assign(dumdb, { myFunction, myFunction2 });
