const nodemailer = require('nodemailer')
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASS,
    },
  });

transporter.verify().then(() => {
    console.log("Mailing ready!")
})

module.exports = transporter;