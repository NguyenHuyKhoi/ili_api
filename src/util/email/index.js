const nodemailer = require('nodemailer')
const handlebars = require('handlebars')
const fs = require('fs')
const path = require('path')


const sendRequestResetPasswordEmail = async (user, link) => {
    sendMail(
        user.email,
        'Request reset password',
        {
            link
        },
        './template/requestResetPassword.hbs'
        )
}

const sendCompleteResetPasswordEmail = async (user) => {
    sendMail(
        user.email,
        'Complete reset password',
        {
        },
        './template/resetPassword.hbs'
        )
}
const sendMail = async (email, subject, payload, template) => {
    try {
        const config = selectConfig()
        const transporter = nodemailer.createTransport(config)

        const source = fs.readFileSync(path.join(__dirname, template),'utf-8')
        const compiledTemplate = handlebars.compile(source)
        const options = () => {
            return {
                from: config.auth.user,
                to: email,
                subject: subject,
                html: compiledTemplate(payload)
            }
        }

        // Send email:
        transporter.sendMail(options(), (err, infor) => {
            if (err) {
               // console.log("Send email error:", err)
            }
            else {
               // console.log("Send email infor :", infor)
            }
        })

    }
    catch (err) {
        return err
    }
}

const selectConfig = () => {
    var mailConfig
    if (process.env.NODE_ENV == 'production') {
        mailConfig = {
            host:  process.env.PROD_MAIL_HOST,
            post:  parseInt(process.env.PROD_MAIL_PORT, 10),
            auth: {
                user:  process.env.PROD_MAIL_USERNAME,
                pass:  process.env.PROD_MAIL_PASSWORD
            }
        }
    }
    else {
        mailConfig = {
            host: process.env.TEMP_MAIL_HOST,
            post: parseInt(process.env.TEMP_MAIL_PORT,10),
            auth: {
                user: process.env.TEMP_MAIL_USERNAME,
                pass: process.env.TEMP_MAIL_PASSWORD
            }
        }
    }
    console.log("Mail config:", mailConfig)
    return mailConfig
}
module.exports = {
    sendMail,
    sendRequestResetPasswordEmail,
    sendCompleteResetPasswordEmail
}