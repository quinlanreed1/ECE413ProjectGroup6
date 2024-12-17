var express = require('express'); //Sets up initial requirements and variables
var router = express.Router();
var Customer = require("../models/customer");
const jwt = require("jwt-simple");
const bcrypt = require("bcryptjs");
const fs = require('fs');
const db = require("../db");

// On AWS ec2, you can use to store the secret in a separate file. 
// The file should be stored outside of your code directory. 
// For encoding/decoding JWT

const secret = fs.readFileSync(__dirname + '/../keys/jwtkey').toString();
// register a new customer

// see javascript/signup.js for ajax call
// see Figure 9.3.5: Node.js project uses token-based authentication and password hashing with bcryptjs on zybooks

router.post("/signUp", function (req, res) { //Adds a new user to the database
   Customer.findOne({ email: req.body.email }, function (err, customer) { //checks to make sure email is not already in use
       if (err) res.status(401).json({ success: false, err: err });
       else if (customer) {
           res.status(401).json({ success: false, msg: "This email already used" });
       }
       else { //if email is not already in use
           const passwordHash = bcrypt.hashSync(req.body.password, 10); //runs password through salted hash
           const newKey = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15); //generates a new random API key
           const newCustomer = new Customer({ //creates the new customer with the entered data
               name: req.body.name,
               email: req.body.email,
               passwordHash: passwordHash,
               apiKey: newKey,
               devices: req.body.device
           });

           newCustomer.save(function (err, customer) { //saves the new customer to the database
               if (err) { //if it fails, display the error
                   res.status(400).json({ success: false, err: err });
               }
               else { //if it succeeds, output a success message and display the API key
                   let msgStr = `Customer (${req.body.email}) account has been created. API key = ` + newKey + '.';
                   res.status(201).json({ success: true, message: msgStr });
                   console.log(msgStr);
               }
           });
       }
   });
});

// see javascript/login.js for ajax call
// see Figure 9.3.5: Node.js project uses token-based authentication and password hashing with bcryptjs on zybooks

router.post("/logIn", function (req, res) { //allows an existing user to log in
   if (!req.body.email || !req.body.password) { //if the email or password is missing
       res.status(401).json({ error: "Missing email and/or password" });
       return;
   }
   // Get user from the database
   Customer.findOne({ email: req.body.email }, function (err, customer) { //look for a user with the give email and password
       if (err) { //if there is an error, display the error message
           res.status(400).send(err);
       }
       else if (!customer) {
           // Username not in the database
           res.status(401).json({ error: "Login failure!!" });
       }
       else {
           if (bcrypt.compareSync(req.body.password, customer.passwordHash)) { //if the password matches the password in the backend
               const token = jwt.encode({ email: customer.email }, secret); //create a token for the user that will allow them to access their account
               //update user's last access time
               customer.lastAccess = new Date();
               customer.save((err, customer) => {
                   console.log("User's LastAccess has been updated.");
               });
               // Send back a token that contains the user's username
               res.status(201).json({ success: true, token: token, msg: "Login success" });
           }
           else { //if the password is incorrect
               res.status(401).json({ success: false, msg: "Email or password invalid." }); 
           }
       }
   });
});

// see javascript/account.js for ajax call
// see Figure 9.3.5: Node.js project uses token-based authentication and password hashing with bcryptjs on zybooks

router.get("/status", function (req, res) { //display the user's status on account entry
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
           if (err) { //if there is an error, send a message back informing the user
               res.status(400).json({ success: false, message: "Error contacting DB. Please contact support." });
           }
           else { //if the function succeeds, send the user status back to the account page
               res.status(200).json(users);
           }
       });
   }
   catch (ex) { //if the JWT does not work, inform the customer
       res.status(401).json({ success: false, message: "Invalid JWT" });
   }
});

router.post("/addDevice", function (req, res) { //add a new device to the customer's account
    Customer.findOneAndUpdate({ email: req.body.email }, { $addToSet: { devices: req.body.device } } , function (err, doc) { //find the customer based on their email and add the device ID if it is not already in their account
        if (err) {
            let msgStr = `Something wrong....`;
            res.status(201).json({ message: msgStr, err: err }); //inform the user if something goes wrong trying to add the new device
        }
        else {
            let msgStr;
            if (doc == null) { //if the customer cannot be found using their email, inform them
                msgStr = `Customer (email: ${req.body.email}) info does not exist in DB.`;
            }
            else { //if the customer has been updated, inform them
                msgStr = `Customer (email: ${req.body.email}) info has been updated.`;
            }
            res.status(201).json({ message: msgStr });
        }
    })
});

router.post('/deviceData', (req, res) => { //receives data from webhook and adds it to customer
    const { API_Key } = req.body; // Extract only the API_Key from the request body
    //finds a customer based on their API key and adds the relevant data from the JSON to the database
    Customer.findOneAndUpdate({ apiKey: API_Key }, { $addToSet: { data: {values: {ID: req.body.coreid, oxygen: req.body.blood_oxygen_level, heartRate: req.body.heart_rate, received: req.body.published_at} } } } , function (err, doc) {
        if (err) { //if an error occurs while reading device data
            console.log("Error reading device data: " + err);
        }
        else { //if there is no error
            if (doc == null) { //if there is no customer with the API key
                console.log("No customer with API key " + API_Key);
            }
            else { //if the data is added successfully
                console.log("Customer with key " + API_Key + "has new data."); 
            }
        }
    })
});

router.post("/weeklyView", function (req, res) { //Output the average, min, and max heartrate for the last week
    let startDate = new Date();
    startDate.setDate(startDate.getDate() - 7); //set a limit on the date so that it only reads the last week
    Customer.find({ email: req.body.email}, function (err, docs) { //look for a customer with the given email
        if (err) { //if the customer does not exist in the database
            msgStr = `Customer (email: ${req.body.email}) info does not exist in DB.`
            res.status(201).json({ message: msgStr });
        }
        else { //if the customer is found
            try {
                //let output = "Average Heart Rate: Normal. Minimum Heart Rate: Why worry? Maximum Heart Rate: Hearing the number certainly won't help."
                db.Customer.aggregate([{
                    $group: {
                        $cond: { //only look at data with the given device ID
                            if: {ID: req.body.device},
                            then: {
                                $cond: { //only look at data with a date later than the start date
                                    if: { $gt: ["$received", startDate] },
                                    then: {
                                        averageHR: {$avg: $heartRate}, //compute the average heart rate
                                        minHR: {$min: $heartRate}, //compute the min heart rate
                                        maxHR: {$max: $heartRate} //compute the max heart rate
                                    },
                                }
                            }
                        }
                    }
                }]);
                if(averageHR > 0) { //if average heart rate was read correctly, output data
                    let output = "Average Heart Rate: " + averageHR + ". Minimum Heart Rate: " + minHR + " Maximum Heart Rate: " + maxHR + "."
                }
                else { //if heart rate read incorrectly, output filler text
                    let output = "Average Heart Rate: Normal. Minimum Heart Rate: Why worry? Maximum Heart Rate: Hearing the number certainly won't help."
                }
                res.status(200).json({message: output});
            }
            catch (ex) { //if the aggregate function failed, output that the data was not found
                res.status(404).json({ success: false, message: "No Data :" + ex});
            }
        }
    });
 });

router.post("/removeDevice", function (req, res) { //allows a customer to remove a device from their account
    Customer.findOneAndUpdate({ email: req.body.email }, { $pull: { devices: req.body.device } } , function (err, doc) { //find a customer based on their email and remove the given device from their account
        if (err) { //if an error occurs finding the customer, inform the user
            let msgStr = `Something wrong....`;
            res.status(201).json({ message: msgStr, err: err });
        }
        else { //if no error occurs
            let msgStr;
            if (doc == null) { //if the customer could not be found
                msgStr = `Customer (email: ${req.body.email}) info does not exist in DB.`;
            }
            else { //if the customer was found and the device was removed
                msgStr = `Customer (email: ${req.body.email}) info has been updated.`;
            }
            res.status(201).json({ message: msgStr });
        }
    })
});

router.post("/update", function (req, res) { //allows the user to update their account information
    let newPasswordHash = bcrypt.hashSync(req.body.password, 10); //converts the new password into a password hash
    Customer.findOneAndUpdate({ email: req.body.email }, {name: req.body.name, email: req.body.email, passwordHash: newPasswordHash}, function (err, doc) { //finds the customer based on their email and updates their information
        if (err) { //if an error occurs updating the user, output the error
            let msgStr = `Something wrong....`;
            res.status(201).json({ message: msgStr, err: err });
        }
        else { //if no error occurs
            let msgStr;
            if (doc == null) { //if the customer could not be found
                msgStr = `Customer (email: ${req.body.email}) info does not exist in DB.`;
            }
            else { //if the customer was found and the account was updated
                msgStr = `Customer (email: ${req.body.email}) info has been updated.`;
            }
            res.status(201).json({ message: msgStr });
        }
    })
});

module.exports = router;