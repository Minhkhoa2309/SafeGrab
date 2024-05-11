require('dotenv').config();

const express = require('express');
const app = express();

const speedsRouter = require('./routes/speedsRouter')
const redlightsRouter = require('./routes/redlightsRouter')
const crashesRouter = require('./routes/crashesRouter')
const congestionsRouter = require('./routes/congestionsRouter')
app.use('/api/v1', speedsRouter)
app.use('/api/v1', redlightsRouter)
app.use('/api/v1', crashesRouter)
app.use('/api/v1', congestionsRouter)

const PORT = 5000 || process.env.PORT;
const startServer = () => {
    try {
        app.listen(PORT, () => {
            console.log("Server is listening on port " + PORT);
        });
    } catch (error) {
        console.log(error)
    }
}

startServer()