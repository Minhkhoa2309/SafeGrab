const { Client } = require("pg");

const client = new Client({
    host: process.env.POSTGRES_HOST_PRODUCTION,
    port: Number(process.env.POSTGRES_PORT),
    user: process.env.POSTGRES_USERNAME,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DATABASE,
});

async function connectDatabase() {
    try {
        await client.connect();
        console.log("Client connect to Postgres successfully!");
    } catch (error) {
        console.log("Error connecting to Postgres", error);
    }
}

module.exports = {
    client,
    connectDatabase,
};
