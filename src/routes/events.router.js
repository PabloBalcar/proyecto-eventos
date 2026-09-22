import { Router } from "express";

import {
  getEvents,
  createEvent,
  updateEvent,
} from "../controllers/events.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorize.middleware.js";
import { authorizeEventOwnerOrAdmin } from "../middlewares/eventOwnership.middleware.js";

const router = Router();

router.get("/", getEvents);

router.post(
  "/",
  authMiddleware,
  authorizeRoles("organizer", "admin"),
  createEvent,
);

router.put(
  "/:eventId",
  authMiddleware,
  authorizeRoles("organizer", "admin"),
  authorizeEventOwnerOrAdmin,
  updateEvent,
);

export default router;
