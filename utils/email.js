const nodemailer = require('nodemailer');

const sendEmail = async options =>{
    const transporter = nodemailer.createTransport({
        host : process.env.EMAIL_HOST,
        port : process.env.EMAIL_PORT,
        auth : {
            user : process.env.EMAIL_USERNAME,
            pass : process.env.EMAIL_PASSWORD
        }
        //Activate in gmail "less sure app" option
    });


    const mailOptions = {
        from :'Micropple james <micropplejame01@gmail.com>',
        to : options.email,
        subject : options.subject,
        text : options.message
    }

  await transporter.sendMail(mailOptions);

}

module.exports = sendEmail;