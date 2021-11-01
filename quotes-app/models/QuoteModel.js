const Joi = require("joi");
const mongoDB = require("mongodb");

const QuoteSchema = Joi.object({
    name: Joi.string().regex(/^(\w|\s)*$/).min(1).max(100).required(),
    quote: Joi.string().min(5).max(1000).required(),
});

class QuoteModel {

    static months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];


    /**
     * 
     * @param {string} name 
     * @param {string} quote 
     * @param {Date} date
     * @param {mongoDB.Collection<mongoDB.Document>} collection 
     */
    constructor(name, quote, date, collection) {
        const validation = QuoteSchema.validate({ name, quote });
        if (validation.error) {
            if (validation.error.message.search(/fails to match the required pattern: \/\^\(\\w\|\\s\)\*\$\//g) !== -1) {
                let revisedError = validation.error.message.match(/"name" with value "(.*?)"/g);
                revisedError += " is not allowed.";
                validation.error.message = revisedError;
            }
            throw validation.error;
        }
        /**
         * @type {string}
         */
        this.name = name;
        /**
         * @type {string}
         */
        this.quote = quote;
        /**
         * @type {Date}
         */
        this.date = date;
        /**
         * @type {mongoDB.Collection<mongoDB.Document>}
         */
        this.collection = collection;
    }

    getTime() {
        const hour = this.date.getHours();
        const minutes = this.date.getMinutes();
        let timeString = `${hour % 12  || 12}:${minutes < 10 ? "0"+minutes : minutes}`;
        if (hour < 12) {
            timeString += " AM";
        } else {
            timeString += " PM";
        }
        return timeString;
    }

    getDate() {
        const month = QuoteModel.months[this.date.getMonth()];
        const day = this.date.getDate();
        const year = this.date.getFullYear();
        return `${month} ${day}, ${year}`;
    }

    async alreadyExists() {
        const document = await this.collection.findOne({ $and: [{ name: { $eq: this.name } }, { quote: { $eq: this.quote } }] });
        return document ? true : false;
    }

    async save() {
        await this.collection.insertOne({ name: this.name, quote: this.quote, time: this.getTime(), date: this.getDate() });
    }
    /**
     * @param {mongoDB.Collection<mongoDB.Document>} collection
     */
    static async getAll(collection) {
        const documents = await collection.find();
        return await documents.toArray();
    }
}

module.exports = QuoteModel;