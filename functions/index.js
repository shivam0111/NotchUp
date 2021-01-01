//boilerplate
const functions = require('firebase-functions');
const admin = require("firebase-admin");
//node.js module to send email
const nodemailer = require('nodemailer');
//module required to restrict resource sharing
const cors = require('cors')({origin: true});

//my secret email and password stored on firebase server
const gmailEmail = functions.config().gmail.email;
const gmailPassword = functions.config().gmail.password;

//initialize firebase app
admin.initializeApp();

//set(transporter) email service provider and account credentials
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: gmailEmail, // enter your gmail ID and password
        pass: gmailPassword
    }
});


//function to send mail on request with appropriate parameters
exports.sendMail = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
      
        //declare parameter
        const parentEmail = req.query.parentEmail;
        const parentName = req.query.parentName;
        const studentName = req.query.studentName;
        const classTime = req.query.classTime;

        //configure mail information and format
        const mailOptions = {
            from: '<>',
            to: parentEmail,
            subject: 'NotchUp Trial Class Booked successfully',
            html: `<p>Dear `+ parentName + ` <br><br>` +
            studentName + ` class at ` + classTime + ` has been successfully booked. </p>`
        };
  
        return transporter.sendMail(mailOptions, (error, info) => {
            if(error){
                return res.send(error.toString());
            }
            return res.send('Sent');
        });
    });    
});