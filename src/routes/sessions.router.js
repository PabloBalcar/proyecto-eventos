import { Router } from "express";
import passport from "passport";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorize.middleware.js";
import {
  getSessions,
  register,
  login,
  getCurrentUser,
  logout,
  getAllUsers,
} from "../controllers/sessions.controller.js";

const router = Router();

router.get("/", getSessions);

router.post(
  "/register",
  passport.authenticate("register", { session: false }),
  register,
);

router.post(
  "/login",
  passport.authenticate("login", { session: false }),
  login,
);

router.get("/current", authMiddleware, getCurrentUser);

router.get("/users", authMiddleware, authorizeRoles("admin"), getAllUsers);

router.post("/logout", logout);

export default router;
