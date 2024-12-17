# ECE413ProjectGroup6
# Heart Rate Monitoring Project
A simple and user-friendly device to measure heartrate and blood oxygen levels.

# Table of Contents
1. Description
2. Installation
3. Links
4. Contact

# Description
The heartrate monitoring device is a simple device that can measure the blood oxygen level and the heartrate by simply placing one's finger on the MAX30102 sensor. The data is then collected by the Argon particle device which sends it to the cloud to be processed. The website allows a user to create an account, log in, register/remove devices, and update their information; unfortunately, while the webpage can read the argon data it is not able to do the weekly or daily display.

# Installation
To set up and run the project locally, you will need the following:
Hardware
1. Argon particle device
2. Heart Rate Sensor (Module MAX30102 Pulse Detection Blood Oxygen)
3. Micro USB cable for data transfer
4. Mini breadboard
5. Jumper wires

Software
1. Particle IDE or Visual studio code.
2. Particle cloud.
3. Amazon AWS.


Steps (Arduino):
1. Build the circuit using online sources. Usually the argon device comes in a box with the circuit on it.
2. Connect argon device to the particle cloud.
3. Connect the argon device to your WIFI or Hotspot.
4. Add you device to the particle cloud/website.
5. Setup an integration in the particle website.
6. Monitor the events section in the particle cloud to view all data from argon device.

Steps (Webpage):
1. Download the webpage files to your computer.
2. Create an AWS instance to run the webpage on and create a key to use with PuTTY and WinSCP.
3. Create a folder in the AWS instance for the project, and create a folder inside that called "myapp" for the webpage files.
4. Using WinSCP, move the webpage files to myapp.
5. Open PuTTY and install NPM onto myapp.
6. Open a second instance of PuTTY and run the command "mongod --dbpath \data" to start MongoDB.
7. With MongoDB running, use the command "npm start" to begin running the server.
8. Follow the link http://(your public dns):3000/ to see the server.
9. Create an account using your Argon device's ID.
10. Log in and enter the account page, where the message box should show your API key.
11. Enter the API key and the link  http://(your public dns):3000/customers/deviceData onto the webhook and start the integration.
12. It should be good to go!


# Links
Currently running webpage: http://ec2-3-129-73-175.us-east-2.compute.amazonaws.com:3000/\
Kickstarter Pitch Video: https://www.youtube.com/watch?v=F0Ki2O7T4Ag\
Final Project Demo Video: https://youtu.be/5yZiM4iggng

Existing username: server@gmail.com
         Password: )OKM9ijn*UHB7ygv

# Contact
Developed by Simon Ngandu, Quinlan Reed and Allen Fan.

Emails:
simongngandu@arizona.edu
quinlanthered@arizona.edu
gfan1@arizona.edu

GitHub:
https://github.com/quinlanreed1/ECE413ProjectGroup6
