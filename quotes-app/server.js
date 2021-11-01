const express = require("express");
const Joi = require("joi");
const app = express();
const connectToMongoDB = require("./db");
const QuoteModel = require("./models/QuoteModel");

let db;
let collection;

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(express.json());
app.set("views", "./views");
app.set("view engine", "ejs");

app.post("/quotes", async (req, res) => {
    try {
        const { name, quote } = req.body;
        const quoteModel = new QuoteModel(name, quote, new Date(), collection);
        if (await quoteModel.alreadyExists()) {
            throw new Joi.ValidationError("An identical entry already exists.");
        }
        await quoteModel.save();
        res.status(201).json({ error: false, message: "The quote was successfully added!" });
    } catch (err) {
        if (err instanceof Joi.ValidationError) {
            res.status(400).json({ error: true, message: err.message });
        } else {
            res.status(500).json({ error: true, message: "The server encountered an unexpected error." });
        }
    }
});

app.get("/quotes", async (req, res) => {
    const quoteDocuments = await QuoteModel.getAll(collection);
    res.render("quotes", { quoteDocuments });
});

async function main() {

    app.listen(3080, () => console.log("listening on port 3080..."));
    [db, collection] = await connectToMongoDB();

}

main()
.then()
.catch();

