import * as eventRepository from "../repositories/event.repository.js";

export const eventOwnership = async (req, res, next) => {
  try {
    const eventId = req.params.eid;

    const event = await eventRepository.getEventById(eventId);

    if (!event) {
      return res.status(404).json({
        status: "error",
        message: "Evento no encontrado",
      });
    }

    if (req.user.role === "admin") {
      req.event = event;
      return next();
    }

    if (
      !event.organizer ||
      event.organizer._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        status: "error",
        message: "No tenés permisos para modificar este evento",
      });
    }

    req.event = event;

    next();
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
