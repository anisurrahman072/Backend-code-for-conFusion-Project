var passport  = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var FacebookTokenStrategy = require('passport-facebook-token');

var User =  require('./models/user');
var config = require('./config.js');
const { Error } = require('mongoose');

passport.use(new LocalStrategy(User.authenticate())); // Need it for signUP(COOKIE) ||  Need it for LogIN
passport.serializeUser(User.serializeUser()); // Need it for signUP(COOKIE) ||  Need it for LogIN
passport.deserializeUser(User.deserializeUser()); // Need it for signUP(must)

exports.getToken = function(user) {
    return jwt.sign(user, config.secretKey,
        {expiresIn: 3600});
};

var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

exports.jwtPassport = passport.use(new JwtStrategy(opts,
    (jwt_payload, done) => {
        console.log("JWT payload: ", jwt_payload);
        User.findOne({_id: jwt_payload._id}, (err, user) => {
            if (err) {
                return done(err, false);
            }
            else if (user) {
                return done(null, user);
            }
            else {
                return done(null, false);
            }
        });
    }));

exports.verifyUser = passport.authenticate('jwt', {session: false});

exports.verifyAdmin = (req, res, next) => {
    if(req.user.admin){
        next();
    }
    else{
        err = new Error('You are not authorized to perform this operation!');
        err.status = 403;
        return next(err);
    }
}

exports.facebookPassport = passport.use(new FacebookTokenStrategy({
        clientID: config.facaebook.clientId,
        clientSecret: config.facaebook.clientSecret
    },
    (accessToke, refreshToken, profile, done) => {
        User.findOne({facebookId: profile.id}, (err, user) => {
            if(err)
                return done(err, false);
            if(!err && user !== null)
                return done(null, user)
            else{ /* Creating new user account in our Express Server */
                 user = new User({username: profile.displayName});
                 user.facebookId = profile.id;
                 user.firstname = profile.name.givenName;
                 user.lastname = profile.name.familyName;
                 user.save((err, user) => {
                     if(err)
                        return done(err, false);
                    else
                        return done(null, user);
                 });
            }
        });
    }
));