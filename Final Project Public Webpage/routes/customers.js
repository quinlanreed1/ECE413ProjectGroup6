var express = require('express');
var router = express.Router();
var Customer = require("../models/customer");
const jwt = require("jwt-simple");
const bcrypt = require("bcryptjs");
const fs = require('fs');

// On AWS ec2, you can use to store the secret in a separate file. 
// The file should be stored outside of your code directory. 
// For encoding/decoding JWT

const secret = fs.readFileSync(__dirname + '/../keys/jwtkey').toString();

// example of authentication
// register a new customer

// please fiil in the blanks
// see javascript/signup.js for ajax call
// see Figure 9.3.5: Node.js project uses token-based authentication and password hashing with bcryptjs on zybooks

router.post("/signUp", function (req, res) {
   Customer.findOne({ email: req.body.email }, function (err, customer) {
       if (err) res.status(401).json({ success: false, err: err });
       else if (customer) {
           res.status(401).json({ success: false, msg: "This email already used" });
       }
       else {
           const passwordHash = bcrypt.hashSync(req.body.password, 10);
           const newKey = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
           const newCustomer = new Customer({
               name: req.body.name,
               email: req.body.email,
               passwordHash: passwordHash,
               apiKey: newKey,
               devices: req.body.device
           });

           newCustomer.save(function (err, customer) {
               if (err) {
                   res.status(400).json({ success: false, err: err });
               }
               else {
                   let msgStr = `Customer (${req.body.email}) account has been created. API key = ` + newKey + '.';
                   res.status(201).json({ success: true, message: msgStr });
                   console.log(msgStr);
               }
           });
       }
   });
});

// please fill in the blanks
// see javascript/login.js for ajax call
// see Figure 9.3.5: Node.js project uses token-based authentication and password hashing with bcryptjs on zybooks

router.post("/logIn", function (req, res) {
   if (!req.body.email || !req.body.password) {
       res.status(401).json({ error: "Missing email and/or password" });
       return;
   }
   // Get user from the database
   Customer.findOne({ email: req.body.email }, function (err, customer) {
       if (err) {
           res.status(400).send(err);
       }
       else if (!customer) {
           // Username not in the database
           res.status(401).json({ error: "Login failure!!" });
       }
       else {
           if (bcrypt.compareSync(req.body.password, customer.passwordHash)) {
               const token = jwt.encode({ email: customer.email }, secret);
               //update user's last access time
               customer.lastAccess = new Date();
               customer.save((err, customer) => {
                   console.log("User's LastAccess has been update.");
               });
               // Send back a token that contains the user's username
               res.status(201).json({ success: true, token: token, msg: "Login success" });
           }
           else {
               res.status(401).json({ success: false, msg: "Email or password invalid." });
           }
       }
   });
});

// please fiil in the blanks
// see javascript/account.js for ajax call
// see Figure 9.3.5: Node.js project uses token-based authentication and password hashing with bcryptjs on zybooks

router.get("/status", function (req, res) {
   // See if the X-Auth header is set
   if (!req.headers["x-auth"]) {
       return res.status(401).json({ success: false, msg: "Missing X-Auth header" });
   }
   // X-Auth should contain the token 
   const token = req.headers["x-auth"];
   try {
       const decoded = jwt.decode(token, secret);
       // Send back email and last access
       Customer.find({ email: decoded.email }, "email devices apiKey lastAccess", function (err, users) {
           if (err) {
               res.status(400).json({ success: false, message: "Error contacting DB. Please contact support." });
           }
           else {
               res.status(200).json(users);
           }
       });
   }
   catch (ex) {
       res.status(401).json({ success: false, message: "Invalid JWT" });
   }
});

router.post("/addDevice", function (req, res) {
    Customer.findOneAndUpdate({ email: req.body.email }, { $addToSet: { devices: req.body.device } } , function (err, doc) {
        if (err) {
            let msgStr = `Something wrong....`;
            res.status(201).json({ message: msgStr, err: err });
        }
        else {
            let msgStr;
            if (doc == null) {
                msgStr = `Customer (email: ${req.body.email}) info does not exist in DB.`;
            }
            else {
                msgStr = `Customer (email: ${req.body.email}) info has been updated.`;
            }
            res.status(201).json({ message: msgStr });
        }
    })
});

router.post('/deviceData', (req, res) => { //receives data from webhook and adds it to customer
    const { API_Key } = req.body; // Extract only the API_Key from the request body

    Customer.findOneAndUpdate({ apiKey: API_Key }, { $addToSet: { data: {values: {ID: req.body.coreid, oxygen: req.body.blood_oxygen_level, heartRate: req.body.heart_rate, received: req.body.published_at} } } } , function (err, doc) {
        if (err) {
            console.log("Error reading device data: " + err);
        }
        else {
            if (doc == null) {
                console.log("No customer with API key " + API_Key);
            }
            else {
                console.log("Customer with key " + API_Key + "has new data."); 
            }
        }
    })
});

router.post("/weeklyView", function (req, res) {
    let startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    Customer.find({ email: req.body.email}, function (err, docs) {
        if (err) {
            msgStr = `Customer (email: ${req.body.email}) info does not exist in DB.`
            res.status(201).json({ message: msgStr });
        }
        else {
            try {
                //let output = "Average Heart Rate: Normal. Minimum Heart Rate: Why worry? Maximum Heart Rate: Hearing the number certainly won't help."
                Customer.data.values.aggregate([{
                    $group: {
                        $cond: {
                            if: {ID: req.body.device},
                            then: {
                                $cond: {
                                    if: { $gt: ["$received", startDate] },
                                    then: {
                                        averageHR: {$avg: $heartRate},
                                        minHR: {$min: $heartRate},
                                        maxHR: {$max: $heartRate}
                                    },
                                }
                            }
                        }
                    }
                }]);
                if(averageHR > 0) {
                    let output = "Average Heart Rate: " + averageHR + ". Minimum Heart Rate: " + minHR + " Maximum Heart Rate: " + maxHR + "."
                }
                else {
                    let output = "Average Heart Rate: Normal. Minimum Heart Rate: Why worry? Maximum Heart Rate: Hearing the number certainly won't help."
                }
                res.status(200).json({message: output});
            }
            catch (ex) {
                res.status(404).json({ success: false, message: "No Data" });
            }
        }
    });
 });

router.post("/removeDevice", function (req, res) {
    Customer.findOneAndUpdate({ email: req.body.email }, { $pull: { devices: req.body.device } } , function (err, doc) {
        if (err) {
            let msgStr = `Something wrong....`;
            res.status(201).json({ message: msgStr, err: err });
        }
        else {
            let msgStr;
            if (doc == null) {
                msgStr = `Customer (email: ${req.body.email}) info does not exist in DB.`;
            }
            else {
                msgStr = `Customer (email: ${req.body.email}) info has been updated.`;
            }
            res.status(201).json({ message: msgStr });
        }
    })
});

router.post("/update", function (req, res) {
    let newPasswordHash = bcrypt.hashSync(req.body.password, 10);
    Customer.findOneAndUpdate({ email: req.body.email }, {name: req.body.name, email: req.body.email, passwordHash: newPasswordHash}, function (err, doc) {
        if (err) {
            let msgStr = `Something wrong....`;
            res.status(201).json({ message: msgStr, err: err });
        }
        else {
            let msgStr;
            if (doc == null) {
                msgStr = `Customer (email: ${req.body.email}) info does not exist in DB.`;
            }
            else {
                msgStr = `Customer (email: ${req.body.email}) info has been updated.`;
            }
            res.status(201).json({ message: msgStr });
        }
    })
});

module.exports = router;