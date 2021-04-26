const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const passportJWT = require('passport-jwt');
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
const bcrypt = require('bcrypt');

async function myPassportLocal(db) {
  const usersCollection = await db.collection('users');
  passport.use(new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password'
  },
    async (username, password, cb) => {
      try {
        const user = await usersCollection.findOne({
          username,
        });
        if (user && bcrypt.compareSync(password, user.password)) {
          return cb(null, user, { message: 'logged in successfully' });
        }
      } catch (e) {
        console.log(e);
      }
    }
  ));
};

function myPassportJWT() {
  passport.use(
    new JWTStrategy({
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: "maSignature"
    }, (jwtPayLoad, cb) => {
      return cb(null, jwtPayLoad);
    })
  );
};

module.exports = {
  myPassportLocal,
  myPassportJWT
};