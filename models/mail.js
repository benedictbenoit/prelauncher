var mailgun = require('mailgun-js')({ apiKey: process.env.MAILGUN_API_KEY, domain: process.env.MAILGUN_DOMAIN })
var mailgun_validation = require('mailgun-js')({ apiKey:process.env.MAILGUN_VALIDATION_KEY, domain: process.env.MAILGUN_DOMAIN })


module.exports.checkEmailAddress = function(email, callback) {
    mailgun_validation.get("/address/validate", { address: email }, function (err, res) {
        if(err) throw err;
        try {
            callback(res.is_valid);
        } catch (e) {
            callback(false);
        }
    });
}

module.exports.sendWelcomeMail = function(email, referralId, callback) {
    var data = {
        from: 'info@seewaldo.com',
        to: email,
        subject: 'Hello to SeeWaldo',
        text: 'Welcome to our service.<br><br>Invite friends using following link: ' + req.get('host') + '?referralId=' + referralId
    };
    
    mailgun.messages().send(data, function (error, body) {
        if(error) throw error;
        console.log(body);
        callback(body)
    });
}