const fs = require("fs");
const path = require("path");

const dumbdb = function(filePath) {
    let jsonDb = {};
    const exists = fs.existsSync(filePath);
    if (exists) {
        // TODO: try w/o "utf8"
        const raw = fs.readFileSync(filePath, "utf8");
        jsonDb = JSON.parse(raw);
    }
    return {
        put(key, val) {
            //destructive:
            jsonDb[key] = val;
            //uneffective:
            const raw = JSON.stringify(jsonDb, null, 4);
            fs.writeFileSync(filePath, raw, "utf8");
            return val;
        },
        get(key) {
            return jsonDb[key];
        },
        del(key) {
            if (delete jsonDb[key]) {
                if (Object.keys(jsonDb).length != 0) {
                    const raw = JSON.stringify(jsonDb, null, 4);
                    fs.writeFileSync(filePath, raw, "utf8");
                } else {
                    // delete the empty database file:
                    fs.unlinkSync(filePath);
                }
            }
            return true;
        },
        valueOf() {
            return jsonDb;
        },
        toString() {
            const fullPath = path.resolve(filePath);
            return `dumbdb(${fullPath})`;
        }
    };
};

module.exports = Object.assign({}, { dumbdb });
