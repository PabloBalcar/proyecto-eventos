import * as eventService from "../services/event.service.js";
import { EventResponseDTO } from "../dto/event-response.dto.js";

export const getEvents = async (req, res) => {
  try {
    const result = await eventService.getEvents(req.query);

    const eventsDTO = result.data.map((event) => new EventResponseDTO(event));

    return res.status(200).json({
      status: "success",
      data: eventsDTO,
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      status: "error",
      message: error.message,
    });
  }
};

export const getEventById = async (req, res) => {
  try {
    const event = await eventService.getEventById(req.params.eid);

    if (!event) {
      return res.status(404).json({
        status: "error",
        message: "Evento no encontrado",
      });
    }

    const eventDTO = new EventResponseDTO(event);

    return res.status(200).json({
      status: "success",
      data: eventDTO,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      status: "error",
      message: error.message,
    });
  }
};

export const createEvent = async (req, res) => {
  try {
    const event = await eventService.createEvent(req.body, req.user._id);

    const eventDTO = new EventResponseDTO(event);

    return res.status(201).json({
      status: "success",
      message: "Evento creado correctamente",
      data: eventDTO,
    });
  } catch (error) {
    return res.status(error.status || 400).json({
      status: "error",
      message: error.message,
    });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const event = await eventService.updateEvent(req.event, req.body);

    const eventDTO = new EventResponseDTO(event);

    return res.status(200).json({
      status: "success",
      message: "Evento actualizado correctamente",
      data: eventDTO,
    });
  } catch (error) {
    return res.status(error.status || 400).json({
      status: "error",
      message: error.message,
    });
  }
};

export const updateEventStatus = async (req, res) => {
  try {
    const event = await eventService.updateEventStatus(
      req.event,
      req.body.status,
    );

    const eventDTO = new EventResponseDTO(event);

    return res.status(200).json({
      status: "success",
      message: "Estado del evento actualizado correctamente",
      data: eventDTO,
    });
  } catch (error) {
    return res.status(error.status || 400).json({
      status: "error",
      message: error.message,
    });
  }
};
