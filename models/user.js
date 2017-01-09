var mongoose = require('mongoose');
var randomString = require('randomstring');

// User Schema
var UserSchema = mongoose.Schema({
    email: { type: String, unique: true},
    verified: {type: Boolean},
    ip: {type: String},
    referralCode : {type: String},
    referrals: [{ email: {type: String}}],
    referralCount: {type: Number},
    createdOn: {type: Date, default: Date.now},
    lastUpdated: {type: Date, default: Date.now}
});

var User = module.exports = mongoose.model('User', UserSchema);

module.exports.getUserByReferralCode = function(referralCode, callback){
	var query = {referralCode: referralCode};
	User.findOne(query, callback);
}

module.exports.saveUser = function(user, callback) {
    user.lastUpdates = Date.Now;
	user.save(callback);
}

module.exports.checkIpCount = function(user, callback) {
    User.find({ip:user.ip}, function(err, users){
        if(err) throw err;
        if(users.length > 3){
            callback(err, true);
        } else {
            callback(err, false);
        } 

    });

}

module.exports.getNewUniqueReferralCode = function(user, callback) {
    getUniqueReferralCode(user, function(err, referralCodeCallback){
        user.referralCode = referralCodeCallback;
        callback(err, user);
    });
}

module.exports.setVerifiedEmail = function(userEmail, verified, callback) {
	User.findOne({email: userEmail}, function(err, user){
        if(err) throw err;
        if(user === null) {
            callback('User not found:' + userEmail);
            return;
        }

        if(verified){
            user.verified = true;
        } else {
            user.verified = false;
            //delete all the referrals
            User.findOneAndUpdate({'referrals.email': userEmail },
             {'$pull': {'referrals': {'email' : userEmail}},
              '$inc': {referralCount : -1}
             }, 
             function(err, tempUser){
                if(err) throw err;
            });
        }
        user.save();
        callback(null);
    });



}


function getUniqueReferralCode (user, callback) {
    var newRefCode;
    newRefCode =  randomString.generate(10);
    User.findOne({referralCode: newRefCode}, function(err, user){
        if(err) {
            console.log(err); 
            return;
        }
        if(user != null) {
            getUniqueReferralCode(user, callback);
            return;
        } else {
            callback(null, newRefCode);
        }
    });
}

