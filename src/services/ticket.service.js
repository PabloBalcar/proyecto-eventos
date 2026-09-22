import * as ticketRepository from "../repositories/ticket.repository.js";
import * as eventRepository from "../repositories/event.repository.js";
import { sendTicketConfirmationEmail } from "./mail.service.js";

const generateReservationCode = () => {
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();

  return `TCK-${random}`;
};

export const createTicket = async (userId, eventId, quantity, user) => {
  const event = await eventRepository.getEventById(eventId);

  if (!event) {
    const error = new Error("Evento no encontrado");
    error.status = 404;
    throw error;
  }

  if (event.status !== "published") {
    const error = new Error("El evento no está disponible para inscripciones");
    error.status = 400;
    throw error;
  }

  if (event.date <= new Date()) {
    const error = new Error("No es posible inscribirse a un evento finalizado");
    error.status = 400;
    throw error;
  }

  const parsedQuantity = Number(quantity);

  if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
    const error = new Error(
      "La cantidad debe ser un número entero mayor a cero",
    );
    error.status = 400;
    throw error;
  }

  const existingTicket = await ticketRepository.findActiveTicket(
    userId,
    eventId,
  );

  if (existingTicket) {
    const error = new Error("Ya tenés una inscripción activa para este evento");
    error.status = 409;
    throw error;
  }

  const reserved = await ticketRepository.countReservedTickets(eventId);

  const available = event.capacity - reserved;

  if (available < parsedQuantity) {
    const error = new Error(
      `No hay cupos suficientes. Disponibles: ${available}`,
    );
    error.status = 400;
    throw error;
  }

  const ticket = await ticketRepository.createTicket({
    user: userId,
    event: eventId,
    status: "confirmed",
    quantity: parsedQuantity,
    reservationCode: generateReservationCode(),
  });

  try {
    await sendTicketConfirmationEmail({
      to: user.email,
      userName: user.first_name,
      eventTitle: event.title,
      ticketCode: ticket.reservationCode,
    });
  } catch {
    // El ticket se mantiene creado aunque falle el envío del email.
  }

  return {
    ticket,
    event,
  };
};

export const getMyTickets = async (userId) => {
  return ticketRepository.getTicketsByUser(userId);
};

export const getEventTickets = async (eventId, userId, role) => {
  const event = await eventRepository.getEventById(eventId);

  if (!event) {
    const error = new Error("Evento no encontrado");
    error.status = 404;
    throw error;
  }

  if (
    role !== "admin" &&
    event.organizer._id.toString() !== userId.toString()
  ) {
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
    const error = new Error("Ticket no encontrado");
    error.status = 404;
    throw error;
  }

  if (!isAdmin && ticket.user._id.toString() !== userId.toString()) {
    const error = new Error("No tenés permisos para cancelar este ticket");
    error.status = 403;
    throw error;
  }

  if (ticket.status === "cancelled") {
    const error = new Error("El ticket ya está cancelado");
    error.status = 400;
    throw error;
  }

  if (ticket.event.date <= new Date()) {
    const error = new Error(
      "No se puede cancelar una inscripción de un evento finalizado",
    );
    error.status = 400;
    throw error;
  }

  return ticketRepository.cancelTicket(ticketId);
};
