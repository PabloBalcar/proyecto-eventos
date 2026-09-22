import { TicketDAO } from "../dao/ticket.dao.js";

const ticketDAO = new TicketDAO();

export const createTicket = async (ticketData) => {
  return ticketDAO.create(ticketData);
};

export const findActiveTicket = async (userId, eventId) => {
  return ticketDAO.findActiveByUserAndEvent(userId, eventId);
};

export const countReservedTickets = async (eventId) => {
  return ticketDAO.countActiveByEvent(eventId);
};

export const getTicketsByUser = async (userId) => {
  return ticketDAO.findByUser(userId);
};

export const getTicketsByEvent = async (eventId) => {
  return ticketDAO.findByEvent(eventId);
};

export const getTicketById = async (ticketId) => {
  return ticketDAO.findById(ticketId);
};

export const cancelTicket = async (ticketId) => {
  return ticketDAO.cancel(ticketId);
};
