import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JwtStrategy } from "passport-jwt";
import * as sessionService from "../services/session.service.js";

passport.use(
  "register",
  new LocalStrategy(
    {
      usernameField: "email",
      passReqToCallback: true,
    },
    async (req, email, password, done) => {
      try {
        const user = await sessionService.registerUser({
          first_name: req.body.first_name,
          last_name: req.body.last_name,
          email,
          password,
        });

        return done(null, user);
      } catch (error) {
        return done(null, false, {
          status: error.status || 400,
          message: error.message,
        });
      }
    },
  ),
);

passport.use(
  "login",
  new LocalStrategy(
    {
      usernameField: "email",
    },
    async (email, password, done) => {
      try {
        const user = await sessionService.validateLogin(email, password);

        return done(null, user);
      } catch (error) {
        return done(null, false, {
          status: error.status || 401,
          message: error.message,
        });
      }
    },
  ),
);

const cookieExtractor = (req) => {
  let token = null;

  if (req && req.cookies) {
    token = req.cookies.currentUser;
  }

  return token;
};

passport.use(
  "current",
  new JwtStrategy(
    {
      jwtFromRequest: cookieExtractor,
      secretOrKey: process.env.JWT_SECRET,
    },
    async (jwtPayload, done) => {
      try {
        const user = await sessionService.getUserById(jwtPayload.id);

        if (!user) {
          return done(null, false);
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    },
  ),
);

export default passport;
