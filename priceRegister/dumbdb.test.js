const os = require("os");
const path = require("path");
const test = require("ava");
const { dumbdb } = require("./dumbdb.js");

//hardcoding the full path - no need for flexibility between unit testing, tools and runtime
const ddb = dumbdb(path.join(os.homedir(), "Projects/fullStack/priceRegister/testdb.json"));
console.log(ddb.toString());
console.log(ddb.valueOf());

test("should add simple value", function(t) {
    const actual1 = ddb.put("kWun", "Wun");
    const actual2 = ddb.get("kWun");
    const expected = "Wun";
    t.is(actual1, actual2, expected);
    ddb.del("kWun");
});

test("should add json object", function(t) {
    const actual1 = ddb.put("kWun", { wun: 1 });
    const actual2 = ddb.get("kWun");
    const expected = { wun: 1 };
    t.deepEqual(actual1, actual2, expected);
    ddb.del("kWun");
});

test("should add json object with array", function(t) {
    const actual1 = ddb.put("kWun", { wun: [1, 2, 3] });
    const actual2 = ddb.get("kWun");
    const expected = { wun: [1, 2, 3] };
    t.deepEqual(actual1, actual2, expected);
    ddb.del("kWun");
});
