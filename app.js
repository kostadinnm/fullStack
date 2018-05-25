const express = require("express");
const expressHandlebars = require("express-handlebars");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const redis = require("redis");
// const path = require("path");

console.log("Running node " + process.version);

// create redis client:
let client = redis.createClient();
client.on("connect", function () {
    console.log("Connected to redis...");
});

const port = 3000;
const app = express();

app.listen(port, function () {
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
app.post("/user/search", function (req, res, next) {
    // 'req.body' carries form post data as json
    let id = req.body.id;
    client.hgetall(id, function (err, obj) {
        if (!obj) {
            res.render("searchusers", {
                error: "User does not exist"
            });
        } else {
            obj.id = id;
            res.render("details", {
                user: obj
            });
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
});
app.delete("/user/delete/:id", function (req, res, next) {
    // params has the query string
    client.del(req.params.id);
    res.redirect("/");
});


// view engine
app.engine("handlebars", expressHandlebars({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

//TODO: add favicon