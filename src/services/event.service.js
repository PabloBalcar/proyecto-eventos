import * as eventRepository from "../repositories/event.repository.js";

const allowedStatuses = ["draft", "published", "cancelled", "finished"];

export const getEvents = async (query) => {
  const {
    status,
    category,
    location,
    dateFrom,
    dateTo,
    page = 1,
    limit = 10,
    sort = "date",
  } = query;

  const filter = {};

  if (status) {
    if (!allowedStatuses.includes(status)) {
      const error = new Error("Estado inválido");
      error.status = 400;
      throw error;
    }

    filter.status = status;
  }

  if (category) {
    filter.category = category;
  }

  if (location) {
    filter.location = {
      $regex: location,
      $options: "i",
    };
  }

  if (dateFrom || dateTo) {
    filter.date = {};

    if (dateFrom) {
      const from = new Date(dateFrom);

      if (Number.isNaN(from.getTime())) {
        const error = new Error("dateFrom inválida");
        error.status = 400;
        throw error;
      }

      filter.date.$gte = from;
    }

    if (dateTo) {
      const to = new Date(dateTo);

      if (Number.isNaN(to.getTime())) {
        const error = new Error("dateTo inválida");
        error.status = 400;
        throw error;
      }

      filter.date.$lte = to;
    }
  }

  const pageNumber = Math.max(Number(page) || 1, 1);

  const limitNumber = Math.min(Math.max(Number(limit) || 10, 1), 50);

  const skip = (pageNumber - 1) * limitNumber;

  const result = await eventRepository.getEvents(filter, {
    sort,
    skip,
    limit: limitNumber,
  });

  return {
    data: result.events,
    page: pageNumber,
    limit: limitNumber,
    total: result.total,
    totalPages: Math.ceil(result.total / limitNumber),
  };
};

export const getEventById = async (id) => {
  return eventRepository.getEventById(id);
};

export const createEvent = async (eventData, userId) => {
  const {
    title,
    description,
    category,
    date,
    location,
    capacity,
    price = 0,
  } = eventData;

  if (!title || !description || !category || !date || !location) {
    const error = new Error("Faltan campos obligatorios");
    error.status = 400;
    throw error;
  }

  const eventDate = new Date(date);

  if (Number.isNaN(eventDate.getTime())) {
    const error = new Error("La fecha del evento no es válida");
    error.status = 400;
    throw error;
  }

  if (eventDate <= new Date()) {
    const error = new Error("La fecha del evento debe ser futura");
    error.status = 400;
    throw error;
  }

  if (!Number.isInteger(Number(capacity)) || Number(capacity) <= 0) {
    const error = new Error(
      "La capacidad debe ser un número entero mayor a cero",
    );
    error.status = 400;
    throw error;
  }

  if (Number.isNaN(Number(price)) || Number(price) < 0) {
    const error = new Error("El precio no puede ser negativo");
    error.status = 400;
    throw error;
  }

  return eventRepository.createEvent({
    title: title.trim(),
    description: description.trim(),
    category,
    date: eventDate,
    location: location.trim(),
    capacity: Number(capacity),
    price: Number(price),
    organizer: userId,
    status: "draft",
  });
};

export const updateEvent = async (event, eventData) => {
  if (event.status === "cancelled") {
    const error = new Error("Los eventos cancelados no pueden modificarse");
    error.status = 400;
    throw error;
  }

  if (eventData.date) {
    const newDate = new Date(eventData.date);

    if (Number.isNaN(newDate.getTime())) {
      const error = new Error("La fecha del evento no es válida");
      error.status = 400;
      throw error;
    }

    if (newDate <= new Date()) {
      const error = new Error("La fecha del evento debe ser futura");
      error.status = 400;
      throw error;
    }

    eventData.date = newDate;
  }

  if (eventData.capacity !== undefined) {
    if (
      !Number.isInteger(Number(eventData.capacity)) ||
      Number(eventData.capacity) <= 0
    ) {
      const error = new Error(
        "La capacidad debe ser un número entero mayor a cero",
      );
      error.status = 400;
      throw error;
    }

    eventData.capacity = Number(eventData.capacity);
  }

  if (eventData.price !== undefined) {
    if (Number.isNaN(Number(eventData.price)) || Number(eventData.price) < 0) {
      const error = new Error("El precio no puede ser negativo");
      error.status = 400;
      throw error;
    }

    eventData.price = Number(eventData.price);
  }

  return eventRepository.updateEvent(event._id, eventData);
};

export const updateEventStatus = async (event, status) => {
  if (!allowedStatuses.includes(status)) {
    const error = new Error("Estado inválido");
    error.status = 400;
    throw error;
  }

  if (event.status === "cancelled") {
    const error = new Error("Un evento cancelado no puede cambiar de estado");
    error.status = 400;
    throw error;
  }

  if (status === "published" && event.date <= new Date()) {
    const error = new Error("No se puede publicar un evento finalizado");
    error.status = 400;
    throw error;
  }

  if (status === "cancelled" && event.date <= new Date()) {
    const error = new Error("No se puede cancelar un evento finalizado");
    error.status = 400;
    throw error;
  }

  return eventRepository.updateEventStatus(event._id, status);
};
