require("dotenv").config();

const express = require("express");
const app = express();
const { connectDatabase } = require("./database/database");

const routers = [
    "speedsRouter",
    "redlightsRouter",
    "crashesRouter",
    // "congestionsRouter",
    // "testRouter",
];

routers.forEach((routerName) => {
    const router = require(`./routes/${routerName}`);
    app.use("/api/v1", router);
});

const port = process.env.PORT || 5000;
const startServer = () => {
    try {
        connectDatabase();
        app.listen(port, () => {
            console.log("Server is listening on port " + port);
        });
    } catch (error) {
        console.log(error);
    }
};

startServer();
