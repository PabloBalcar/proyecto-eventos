import { EventDAO } from "../dao/event.dao.js";

const eventDAO = new EventDAO();

export const getEvents = async (filter, options = {}) => {
  const [events, total] = await Promise.all([
    eventDAO.findAll(filter, options),
    eventDAO.count(filter),
  ]);

  return {
    events,
    total,
  };
};

export const getEventById = async (id) => {
  return eventDAO.findById(id);
};

export const createEvent = async (eventData) => {
  return eventDAO.create(eventData);
};

export const updateEvent = async (id, eventData) => {
  return eventDAO.update(id, eventData);
};

export const updateEventStatus = async (id, status) => {
  return eventDAO.updateStatus(id, status);
};
