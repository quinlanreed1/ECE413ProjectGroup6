const db = require("../db");

const customerSchema = new db.Schema({
    name:           String,
    email:          String,
    passwordHash:   String,
    devices:        Array,
    lastAccess:     { type: Date, default: Date.now },
 });

 const Customer = db.model("Customer", customerSchema);

module.exports = Customer;