const mongoDB = require("mongodb");

const url = "mongodb://localhost:27017";
const client = new mongoDB.MongoClient(url);

const dbName = "AwesomeQuotes";

const connectToMongoDB = async () => {
    try {
        await client.connect();
        console.log("Connected to MongoDB!");
        const db = client.db(dbName);
        const collection = db.collection("QuotesCollection");
        return [ db, collection ];
    } catch (err) {
        console.error(err);
    }
};

module.exports = connectToMongoDB;