import * as eventService from "../services/event.service.js";

export const getEvents = async (req, res) => {
  try {
    const result = await eventService.getEvents(req.query);

    return res.status(200).json({
      status: "success",
      ...result,
    });
  } catch (error) {
    return res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

export const getEventById = async (req, res) => {
  try {
    const event = await eventService.getEventById(req.params.id);

    if (!event) {
      return res.status(404).json({
        status: "error",
        message: "Evento no encontrado",
      });
    }

    return res.status(200).json({
      status: "success",
      data: event,
    });
  } catch (error) {
    return res.status(400).json({
      status: "error",
      message: "ID de evento inválido",
    });
  }
};

export const createEvent = async (req, res) => {
  try {
    const event = await eventService.createEvent(req.body, req.user._id);

    return res.status(201).json({
      status: "success",
      message: "Evento creado correctamente",
      data: event,
    });
  } catch (error) {
    return res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const event = await eventService.updateEvent(req.event, req.body);

    return res.status(200).json({
      status: "success",
      message: "Evento actualizado correctamente",
      data: event,
    });
  } catch (error) {
    return res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

export const updateEventStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        status: "error",
        message: "El status es obligatorio",
      });
    }

    const event = await eventService.updateEventStatus(req.event, status);

    return res.status(200).json({
      status: "success",
      message: "Estado del evento actualizado correctamente",
      data: event,
    });
  } catch (error) {
    return res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};
