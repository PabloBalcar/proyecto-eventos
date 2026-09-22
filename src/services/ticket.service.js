import * as ticketRepository from "../repositories/ticket.repository.js";
import { EventModel } from "../models/Event.js";

const generateReservationCode = () => {
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();

  return `TCK-${random}`;
};

export const createTicket = async (userId, eventId, quantity) => {
  const event = await EventModel.findById(eventId);

  if (!event) {
    throw new Error("Evento no encontrado");
  }

  if (event.status !== "published") {
    throw new Error("El evento no está disponible para inscripciones");
  }

  if (event.date <= new Date()) {
    throw new Error("No es posible inscribirse a un evento finalizado");
  }

  const parsedQuantity = Number(quantity);

  if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
    throw new Error("La cantidad debe ser un número entero mayor a cero");
  }

  const existingTicket = await ticketRepository.findActiveTicket(
    userId,
    eventId,
  );

  if (existingTicket) {
    throw new Error("Ya tenés una inscripción activa para este evento");
  }

  const reserved = await ticketRepository.countReservedTickets(eventId);

  const available = event.capacity - reserved;

  if (available < parsedQuantity) {
    throw new Error(`No hay cupos suficientes. Disponibles: ${available}`);
  }

  const ticket = await ticketRepository.createTicket({
    user: userId,
    event: eventId,
    status: "confirmed",
    quantity: parsedQuantity,
    reservationCode: generateReservationCode(),
  });

  return {
    ticket,
    event,
  };
};

export const getMyTickets = async (userId) => {
  return ticketRepository.getTicketsByUser(userId);
};

export const getEventTickets = async (eventId, userId, role) => {
  const event = await EventModel.findById(eventId);

  if (!event) {
    throw new Error("Evento no encontrado");
  }

  if (role !== "admin" && event.organizer.toString() !== userId.toString()) {
    const error = new Error(
      "No tenés permisos para ver los tickets de este evento",
    );
    error.status = 403;
    throw error;
  }

  return ticketRepository.getTicketsByEvent(eventId);
};

export const cancelTicket = async (ticketId, userId, isAdmin) => {
  const ticket = await ticketRepository.getTicketById(ticketId);

  if (!ticket) {
    throw new Error("Ticket no encontrado");
  }

  if (!isAdmin && ticket.user._id.toString() !== userId.toString()) {
    const error = new Error("No tenés permisos para cancelar este ticket");
    error.status = 403;
    throw error;
  }

  if (ticket.status === "cancelled") {
    throw new Error("El ticket ya está cancelado");
  }

  if (ticket.event.date <= new Date()) {
    throw new Error(
      "No se puede cancelar una inscripción de un evento finalizado",
    );
  }

  return ticketRepository.cancelTicket(ticketId);
};
