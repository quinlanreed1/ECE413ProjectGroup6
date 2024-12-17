const db = require("../db");


const customerSchema = new db.Schema({
    name:           String,
    email:          String,
    passwordHash:   String,
    apiKey:         String,
    devices:        Array,
    data:        [{ //creates an array of datapoints representing data received from any devices with the customer's API key
        values: {
            ID: String, //This ID will be compared to the strings in the "devices" array to determine whether or not to display it at the customer's request
            oxygen: Number,
            heartRate: Number,
            received: Date //This will be used to determine which values to include based on date
        },
    }],
    lastAccess:     { type: Date, default: Date.now },
 });

 const Customer = db.model("Customer", customerSchema);

module.exports = Customer;