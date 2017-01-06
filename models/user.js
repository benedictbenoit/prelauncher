var mongoose = require('mongoose');
var randomString = require('randomstring');

// User Schema
var UserSchema = mongoose.Schema({
    email: { type: String, index: true},
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

