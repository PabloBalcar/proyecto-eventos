import * as ticketService from "../services/ticket.service.js";
import { sendTicketConfirmationEmail } from "../services/mail.service.js";

export const createTicket = async (req, res) => {
  try {
    const { eid } = req.params;
    const { quantity = 1 } = req.body;

    const result = await ticketService.createTicket(
      req.user._id,
      eid,
      quantity,
    );

    try {
      await sendTicketConfirmationEmail({
        to: req.user.email,
        userName: req.user.first_name,
        eventTitle: result.event.title,
        ticketCode: result.ticket.reservationCode,
      });
    } catch (emailError) {
      console.log("No se pudo enviar el email de confirmación");
    }

    return res.status(201).json({
      status: "success",
      message: "Inscripción realizada correctamente",
      data: result.ticket,
    });
  } catch (error) {
    return res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

export const getMyTickets = async (req, res) => {
  try {
    const tickets = await ticketService.getMyTickets(req.user._id);

    return res.status(200).json({
      status: "success",
      data: tickets,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

export const getEventTickets = async (req, res) => {
  try {
    const tickets = await ticketService.getEventTickets(req.params.eid);

    return res.status(200).json({
      status: "success",
      data: tickets,
    });
  } catch (error) {
    return res.status(404).json({
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

    return res.status(200).json({
      status: "success",
      message: "Inscripción cancelada correctamente",
      data: ticket,
    });
  } catch (error) {
    return res.status(error.status || 400).json({
      status: "error",
      message: error.message,
    });
  }
};
