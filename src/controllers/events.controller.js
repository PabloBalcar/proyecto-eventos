import { EventModel } from "../models/Event.js";

export const getEvents = (req, res) => {
  res.status(200).json({
    status: "success",
    payload: [],
  });
};

export const createEvent = async (req, res) => {
  try {
    const { title, description, date, location, capacity } = req.body;

    const event = await EventModel.create({
      title,
      description,
      date,
      location,
      capacity,
      organizer: req.user._id,
    });

    return res.status(201).json({
      status: "success",
      message: "Evento creado correctamente",
      payload: event,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error al crear el evento",
    });
  }
};
export const updateEvent = async (req, res) => {
  try {
    const { title, description, date, location, capacity } = req.body;

    req.event.title = title ?? req.event.title;
    req.event.description = description ?? req.event.description;
    req.event.date = date ?? req.event.date;
    req.event.location = location ?? req.event.location;
    req.event.capacity = capacity ?? req.event.capacity;

    await req.event.save();

    return res.status(200).json({
      status: "success",
      message: "Evento actualizado correctamente",
      payload: req.event,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error al actualizar el evento",
    });
  }
};
