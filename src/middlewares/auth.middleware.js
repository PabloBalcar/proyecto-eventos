import passport from "passport";

export const authMiddleware = (req, res, next) => {
  passport.authenticate("current", { session: false }, (error, user) => {
    if (error) {
      return next(error);
    }

    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "No autenticado",
      });
    }

    req.user = user;
    next();
  })(req, res, next);
};
