require("dotenv").config();

const express = require("express");
const app = express();
const { connectDatabase } = require("./database/database");

const routers = [
    "speedsRouter",
    "redlightsRouter",
    "crashesRouter",
    "congestionsRouter",
    "testRouter",
];

routers.forEach((routerName) => {
    const router = require(`./routes/${routerName}`);
    app.use("/api/v1", router);
});

const PORT = 5000 || process.env.PORT;
const startServer = () => {
    try {
        connectDatabase();
        app.listen(PORT, () => {
            console.log("Server is listening on port " + PORT);
        });
    } catch (error) {
        console.log(error);
    }
};

startServer();
