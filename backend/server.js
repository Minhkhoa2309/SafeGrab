require("dotenv").config();

// Security packages
const helmet = require("helmet");
const cors = require("cors");
const rateLimiter = require("express-rate-limit");

// HTTPS-related packages
const https = require("https");
const fs = require("fs");
const path = require("path");

// ExpressJS package
const express = require("express");
const app = express();
const { connectDatabase } = require("./database/database");

app.set("trust proxy", 1);
app.use(
    rateLimiter({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // 100 requests per windowMs
    })
);
app.use(express.json());
app.use(helmet());
app.use(cors());

const routers = [
    "speedsRouter",
    "redlightsRouter",
    "crashesRouter",
    "navigationRouter",
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
const sslOptions = {
    key: fs.readFileSync(
        path.join(__dirname, process.env.SSL_KEY_PATH || "local-server.key")
    ),
    cert: fs.readFileSync(
        path.join(__dirname, process.env.SSL_CERT_PATH || "local-server.cert")
    ),
};
const startServer = () => {
    try {
        connectDatabase();
        https.createServer(sslOptions, app).listen(port, () => {
            console.log("HTTPS Server is listening on port " + port);
        });
        // app.listen(port, () => {
        //     console.log("Server is listening on port " + port);
        // });
    } catch (error) {
        console.log(error);
    }
};

startServer();
