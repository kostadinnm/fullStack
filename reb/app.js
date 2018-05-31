const express = require("express");
const expressHandlebars = require("express-handlebars");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const redis = require("redis");
// const path = require("path");

console.log("Running node " + process.version);

// create redis client:
const userPrefix = "travUser";
let client = redis.createClient({ prefix: userPrefix });
client.on("connect", function () {
    console.log("Connected to redis...");
});

const port = 3000;
const app = express();

// this is a simple administrative site - for now it's set up NOT to be accessible
// outside the middleware host(the same as the redis db)
app.listen(port, "localhost", function () {
    console.log("App listening on port " + port);
});

// page url data('extended' is false for flatter structure)
let urlParser = bodyParser.urlencoded({ extended: false });
app.use(urlParser);
// mock all http actions(put, delete) through 'post'(overriding takes place before express handlers)
let methOverride = methodOverride("_httpaction", { methods: ["POST"] });
app.use(methOverride);

// form json data
let jsonParser = bodyParser.json();
app.use(jsonParser);


app.get("/", function (req, res, next) {
    res.render("searchusers");
});
app.post("/searchusers", function (req, res, next) {
    // 'req.body' carries form post data as json
    let id = req.body.id;
    console.log("SEARCH USERS ID: " + id);
    client.batch().scan("0", "MATCH", userPrefix + "*" + id + "*")
        .exec(function (err, replies) {
            if (err) {
                console.log("Error: " + err);
                res.render("searchusers", {
                    error: "Error fetching users"
                });
            } else {
                let allUsers = [];
                let usersKeys = replies[0][1];
                console.log(JSON.stringify(replies));
                usersKeys.forEach(function (key, index) {
                    let k = key.substring(userPrefix.length);
                    console.log("GET USER FIELDS ID: " + key);
                    client.hgetall(k, function (err, userData) {
                        if (err) {
                            console.log("Error getting user data: " + err);
                        } else if (!userData) {
                            console.log("No user data");
                        } else {
                            userData.id = k;
                            allUsers.push(userData);
                        }
                    });
                });
                if (!usersKeys.length) {
                    res.render("searchusers", {
                        error: "User(s) with id '" + id + "' cannot be found"
                    });
                } else {
                    res.render("searchusers", {
                        users: allUsers,
                        message: "Found user(s) matching id '" + id + "'"
                    });
                }
            }
        });
});
app.get("/user/add", function (req, res, next) {
    res.render("adduser");
});
app.post("/user/add", function (req, res, next) {
    let id = req.body.id;
    let firstName = req.body.first_name;
    let lastName = req.body.last_name;
    let email = req.body.email;
    let phone = req.body.phone;

    console.log("ADD USER ID: " + id);
    client.exists(id, function (err, obj) {
        if (err) {
            console.log(err);
            res.render("adduser", {
                error: "Error checking user exists"
            });
        } else if (obj) {
            res.render("adduser", {
                id: id,
                error: "User exists - please edit it",
                exists: true
            });
        } else {
            console.log("ADD USER ID: " + id);
            client.hmset(id, [
                "first_name", firstName,
                "last_name", lastName,
                "email", email,
                "phone", phone
            ], function (err, reply) {
                if (err) {
                    console.log(err);
                }
                console.log(reply);
                res.redirect("/");
            });
        }
    });
});
app.get("/user/edit/:id", function (req, res, next) {
    // params has the query string
    let id = req.params.id;
    console.log("EDIT USER ID: " + id);
    client.hgetall(id, function (err, obj) {
        if (!obj) {
            res.render("edituser", {
                error: "User does not exist"
            });
        } else {
            obj.id = id;
            res.render("edituser", {
                user: obj
            });
        }
    });
});
app.post("/user/edit/:id", function (req, res, next) {
    let id = req.params.id;
    let firstName = req.body.first_name;
    let lastName = req.body.last_name;
    let email = req.body.email;
    let phone = req.body.phone;
    console.log("EDIT USER ID: " + id);
    client.hmset(id, [
        "first_name", firstName,
        "last_name", lastName,
        "email", email,
        "phone", phone
    ], function (err, reply) {
        if (err) {
            console.log(err);
        }
        console.log(reply);
        res.redirect("/");
    });
})
app.delete("/user/delete/:id", function (req, res, next) {
    let id = req.params.id;
    console.log("DELETE USER ID: " + id);
    client.del(id, function (err, obj) {
        if (err) {
            console.log(err);
        }
    })
    res.redirect("/");
});
app.get("/userlist", function (req, res, next) {
    res.render("userlist");
});
app.get("*", function (req, res, next) {
    res.render("hitrock");
})

// view engine
app.engine("handlebars", expressHandlebars({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

//TODO: add favicon