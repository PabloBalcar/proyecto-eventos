import { Router } from "express";

import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  updateEventStatus,
} from "../controllers/events.controller.js";

import {
  createTicket,
  getEventTickets,
} from "../controllers/ticket.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorize.middleware.js";
import { eventOwnership } from "../middlewares/eventOwnership.middleware.js";

const router = Router();

// Público
router.get("/", getEvents);

router.get("/:eid", getEventById);

// Organizer y admin
router.post(
  "/",
  authMiddleware,
  authorizeRoles("organizer", "admin"),
  createEvent,
);

// Dueño o admin
router.put(
  "/:eid",
  authMiddleware,
  authorizeRoles("organizer", "admin"),
  eventOwnership,
  updateEvent,
);

router.patch(
  "/:eid/status",
  authMiddleware,
  authorizeRoles("organizer", "admin"),
  eventOwnership,
  updateEventStatus,
);

// Tickets
router.post("/:eid/tickets", authMiddleware, createTicket);

router.get(
  "/:eid/tickets",
  authMiddleware,
  authorizeRoles("organizer", "admin"),
  getEventTickets,
);

export default router;
