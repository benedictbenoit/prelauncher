var mailgun = require('mailgun-js')({ apiKey: (process.env.MAILGUN_API_KEY || 'key-9dce3f573e6a4c36e4911aacc69ba02b'), domain: (process.env.MAILGUN_DOMAIN || 'seewaldo.com') })
var mailgun_validation = require('mailgun-js')({ apiKey: (process.env.MAILGUN_VALIDATION_KEY || 'pubkey-a8b9d5f242f7900bfd98c4d53df74b1e'), domain: (process.env.MAILGUN_DOMAIN || 'seewaldo.com') })


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

module.exports.sendWelcomeMail = function(email, host, referralId, callback) {
    var data = {
        from: 'info@seewaldo.com',
        to: email,
        subject: 'Hello to SeeWaldo',
        text: 'Welcome to our service. Invite friends using following link: ' + host + '?referralId=' + referralId
    };
    
    mailgun.messages().send(data, function (error, body) {
        if(error) throw error;
        console.log(body);
        callback(body)
    });
}