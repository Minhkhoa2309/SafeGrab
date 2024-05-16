require("dotenv").config();

// Security package
const helmet = require("helmet");
const cors = require("cors");
const rateLimiter = require("express-rate-limit");

// ExpressJS package
const express = require("express");
const app = express();
const { connectDatabase } = require("./database/database");

app.set('trust proxy', 1)
app.use(rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // 100 requests per windowMs
}))
app.use(express.json())
app.use(helmet())
app.use(cors())

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

app.use("/", (req, res) => {
    res.status(200).send("Connection successful");
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
