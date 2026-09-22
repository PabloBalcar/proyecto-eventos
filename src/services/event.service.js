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
      throw new Error("Estado inválido");
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
        throw new Error("dateFrom inválida");
      }

      filter.date.$gte = from;
    }

    if (dateTo) {
      const to = new Date(dateTo);

      if (Number.isNaN(to.getTime())) {
        throw new Error("dateTo inválida");
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
    throw new Error("Faltan campos obligatorios");
  }

  const eventDate = new Date(date);

  if (Number.isNaN(eventDate.getTime())) {
    throw new Error("La fecha del evento no es válida");
  }

  if (eventDate <= new Date()) {
    throw new Error("La fecha del evento debe ser futura");
  }

  if (Number(capacity) <= 0) {
    throw new Error("La capacidad debe ser mayor a cero");
  }

  if (Number(price) < 0) {
    throw new Error("El precio no puede ser negativo");
  }

  return eventRepository.createEvent({
    title,
    description,
    category,
    date: eventDate,
    location,
    capacity: Number(capacity),
    price: Number(price),
    organizer: userId,
    status: "draft",
  });
};

export const updateEvent = async (event, eventData) => {
  if (event.status === "cancelled") {
    throw new Error("Los eventos cancelados no pueden modificarse");
  }

  if (eventData.date) {
    const newDate = new Date(eventData.date);

    if (Number.isNaN(newDate.getTime())) {
      throw new Error("La fecha del evento no es válida");
    }

    if (newDate <= new Date()) {
      throw new Error("La fecha del evento debe ser futura");
    }

    eventData.date = newDate;
  }

  if (eventData.capacity !== undefined && Number(eventData.capacity) <= 0) {
    throw new Error("La capacidad debe ser mayor a cero");
  }

  if (eventData.price !== undefined && Number(eventData.price) < 0) {
    throw new Error("El precio no puede ser negativo");
  }

  return eventRepository.updateEvent(event._id, eventData);
};

export const updateEventStatus = async (event, status) => {
  if (!allowedStatuses.includes(status)) {
    throw new Error("Estado inválido");
  }

  if (event.status === "cancelled") {
    throw new Error("Un evento cancelado no puede cambiar de estado");
  }

  if (status === "published") {
    if (event.date <= new Date()) {
      throw new Error("No se puede publicar un evento finalizado");
    }
  }

  if (status === "cancelled") {
    if (event.date <= new Date()) {
      throw new Error("No se puede cancelar un evento finalizado");
    }
  }

  return eventRepository.updateEventStatus(event._id, status);
};
