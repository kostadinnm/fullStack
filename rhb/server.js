const hapi = require("hapi");
const vision = require("vision");

const server = hapi.server({
    port: 3000,
    host: "localhost"
});

server.route({
    method: "GET",
    path: "/",
    handler: function(request, h) {
        return "Hello, world!";
    }
});
server.route({
    method: "GET",
    path: "/{name}",
    handler: function(request, h) {
        return "Hello, " + encodeURIComponent(request.params.name) + "!";
    }
});

process.on("unhandledRejection", function (err) {
    console.log(err);
    process.exit(1);
});

server.register(require("inert"))
    .then(function () {
        server.route({
            method: "GET",
            path: "/hello",
            handler: function (request, h) {
                return h.file("./public/index.html");
            }
        });
        return server.start();
    })
    .then(function () {
        console.log(`Server running at ${server.info.uri}`);
        // call implicit return to conform to promises' good practice
        return undefined;
    })
    .catch(function (err) {
        console.log(err);
    });