import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { UserModel } from "../models/User.js";
import { createHash, isValidPassword } from "../utils/hash.js";

// ==============================
// STRATEGY: REGISTER
// ==============================

passport.use(
  "register",
  new LocalStrategy(
    {
      usernameField: "email",
      passReqToCallback: true,
    },
    async (req, email, password, done) => {
      try {
        const { first_name, last_name } = req.body;

        if (!first_name || !last_name || !email || !password) {
          return done(null, false, {
            status: 400,
            message: "Faltan campos obligatorios",
          });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email.trim())) {
          return done(null, false, {
            status: 400,
            message: "El email no tiene un formato válido",
          });
        }

        if (password.length < 6) {
          return done(null, false, {
            status: 400,
            message: "La contraseña debe tener al menos 6 caracteres",
          });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const userExists = await UserModel.findOne({
          email: normalizedEmail,
        });

        if (userExists) {
          return done(null, false, {
            status: 409,
            message: "El email ya está registrado",
          });
        }

        const hashedPassword = await createHash(password);

        const newUser = await UserModel.create({
          first_name: first_name.trim(),
          last_name: last_name.trim(),
          email: normalizedEmail,
          password: hashedPassword,
          role: "user",
        });

        return done(null, newUser);
      } catch (error) {
        return done(error);
      }
    },
  ),
);

// ==============================
// STRATEGY: LOGIN
// ==============================

passport.use(
  "login",
  new LocalStrategy(
    {
      usernameField: "email",
    },
    async (email, password, done) => {
      try {
        const normalizedEmail = email.toLowerCase().trim();

        const user = await UserModel.findOne({
          email: normalizedEmail,
        });

        if (!user) {
          return done(null, false, {
            status: 401,
            message: "Credenciales inválidas",
          });
        }

        const validPassword = await isValidPassword(password, user.password);

        if (!validPassword) {
          return done(null, false, {
            status: 401,
            message: "Credenciales inválidas",
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    },
  ),
);

// ==============================
// STRATEGY: CURRENT
// ==============================

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
        const user = await UserModel.findById(jwtPayload.id);

        if (!user) {
          return done(null, false, {
            message: "Usuario no encontrado",
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    },
  ),
);

export default passport;
