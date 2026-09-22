import * as ticketService from "../services/ticket.service.js";
import { TicketResponseDTO } from "../dto/ticket-response.dto.js";

export const createTicket = async (req, res) => {
  try {
    const { eid } = req.params;
    const { quantity = 1 } = req.body;

    const result = await ticketService.createTicket(
      req.user._id,
      eid,
      quantity,
      req.user,
    );

    const ticketDTO = new TicketResponseDTO(result.ticket);

    return res.status(201).json({
      status: "success",
      message: "Inscripción realizada correctamente",
      data: ticketDTO,
    });
  } catch (error) {
    return res.status(error.status || 400).json({
      status: "error",
      message: error.message,
    });
  }
};

export const getMyTickets = async (req, res) => {
  try {
    const tickets = await ticketService.getMyTickets(req.user._id);

    const ticketsDTO = tickets.map((ticket) => new TicketResponseDTO(ticket));

    return res.status(200).json({
      status: "success",
      data: ticketsDTO,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      status: "error",
      message: error.message,
    });
  }
};

export const getEventTickets = async (req, res) => {
  try {
    const tickets = await ticketService.getEventTickets(
      req.params.eid,
      req.user._id,
      req.user.role,
    );

    const ticketsDTO = tickets.map((ticket) => new TicketResponseDTO(ticket));

    return res.status(200).json({
      status: "success",
      data: ticketsDTO,
    });
  } catch (error) {
    return res.status(error.status || 400).json({
      status: "error",
      message: error.message,
    });
  }
};

export const cancelTicket = async (req, res) => {
  try {
    const ticket = await ticketService.cancelTicket(
      req.params.tid,
      req.user._id,
      req.user.role === "admin",
    );

    const ticketDTO = new TicketResponseDTO(ticket);

    return res.status(200).json({
      status: "success",
      message: "Inscripción cancelada correctamente",
      data: ticketDTO,
    });
  } catch (error) {
    return res.status(error.status || 400).json({
      status: "error",
      message: error.message,
    });
  }
};
