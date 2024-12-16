const db = require("../db");

const customerSchema = new db.Schema({
    name:           String,
    email:          String,
    passwordHash:   String,
    apiKey:         String,
    devices:        Array,
    data:        [{
        values: {
            ID: String,
            oxygen: Number,
            heartRate: Number,
            received: Date
        },
    }],
    lastAccess:     { type: Date, default: Date.now },
 });

 const Customer = db.model("Customer", customerSchema);

module.exports = Customer;