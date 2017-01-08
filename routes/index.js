var express = require('express');
var https = require('https');
var router = express.Router();
var User = require('../models/user');
var Mail = require('../models/mail');

var app = express();


// Get Homepage
router.get('/', function (req, res) {
    res.render('index', { referralId: req.query.referralId });
});

router.post('/subscribe', function (req, res) {

    /*verifyRecaptcha(req.body["g-recaptcha-response"], function(success) {
       //check captcha success
       if(!success) {
           req.flash('error_msg', 'Captcha response was unsuccessful, please retry.');
           res.redirect('/');
           return;
       }*/


    Mail.checkEmailAddress(req.body.email, function (emailcheckResult) { // Returns "true" if the email address exists, "false" if it doesn't. 
            if (!emailcheckResult) {
                req.flash('error_msg', 'Incorrect e-mail address.');
                res.redirect('/');
                return;
            }

            var ReferralId = req.query.referralId;
            var ReturnUser
            var ReferralUser

            //Create new users
            ReturnUser = new User({
                email: req.body.email,
                ip: req.headers['x-forwarded-for'],
                referralCount: 0
            });


            /* 
            prevent abuse
              - Only allow 3 emails from same IP
              - Send Welcome mail, make sure it doesn't bounce.
              
            */
            User.checkIpCount(ReturnUser, function (err, failed) {
                if (err) { throw err; }
                if (failed) {
                    req.flash('error_msg', 'Too many subscriptions from same IP.');
                    res.redirect('/');
                    return;
                } else {
                    User.getNewUniqueReferralCode(ReturnUser, function (err, user) {
                        if (err) throw err;
                        User.saveUser(user, function (err, user) {
                            if (err) throw err;
                            res.render('refer-a-friend', { referralCode: user.referralCode, default_url : req.get('host'), twitter_message :"bene's test" });
                            Mail.sendWelcomeMail(ReturnUser.email, req.get('host'), user.referralCode, function(body){})
                        });
                    });
                }
            });




            //in case it has a referral id, add it to refferals
            if (ReferralId != undefined) {
                User.getUserByReferralCode(ReferralId, function (err, user) {
                    if (err) throw err
                    user.referralCount = user.referralCount + 1;
                    user.referrals.addToSet({ email: req.body.email });

                    User.saveUser(user, function (err, user) {
                        if (err) throw err;
                    });
                });

            }
        });
    // }); --recaptcha
});

// MAIL Hooks
var multer = require('multer');  
var msg = multer(); 

router.post('/mail/delivered', msg.any(), function (req, res, next) {
    Mail.validateWebhook(req, function(err){
        if(err) {
            res.status(500).json({ error: { message: err}});
            return;
        } else {
            User.setVerifiedEmail(req.body.recipient, true, function(err){
                if(err) {
                    console.log(err);
                    res.status(500).json({ error: { message: err}});
                    return;
                } else {
                    res.status(200);
                    return;
                }
            });          
        }
    })
});


router.get('/mail/failed', msg.any(),  function (req, res, next) {
    Mail.validateWebhook(req, function(err){
        if(err) {
            res.status(500).json({ error: { message: err}});
            return;
        } else {
            User.setVerifiedEmail(req.body.recipient, false, function(err){
                if(err) {
                    console.log(err);
                    res.status(500).json({ error: { message: err}});
                    return;
                } else {
                    res.status(200);
                    return;
                }
            });          
        }
    })
});


module.exports = router;



/*
var SECRET = '6LdIUhAUAAAAAKJq6vOeE0M8ohN_KnWL0hiApZ9Y'
function verifyRecaptcha(key, callback) {
    https.get("https://www.google.com/recaptcha/api/siteverify?secret=" + SECRET + "&response=" + key, function (res) {
        var data = "";
        res.on('data', function (chunk) {
            data += chunk.toString();
        });
        res.on('end', function () {
            try {
                var parsedData = JSON.parse(data);
                console.log(parsedData);
                callback(parsedData.success);
            } catch (e) {
                callback(false);
            }
        });
    });
}*/