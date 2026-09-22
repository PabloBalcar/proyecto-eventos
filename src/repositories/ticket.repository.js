import { TicketModel } from "../models/Ticket.js";

export const createTicket = async (ticketData) => {
  return TicketModel.create(ticketData);
};

export const findActiveTicket = async (userId, eventId) => {
  return TicketModel.findOne({
    user: userId,
    event: eventId,
    status: { $in: ["confirmed", "pending"] },
  });
};

export const countReservedTickets = async (eventId) => {
  const result = await TicketModel.aggregate([
    {
      $match: {
        event: eventId,
        status: { $in: ["confirmed", "pending"] },
      },
    },
    {
      $group: {
        _id: "$event",
        totalReserved: {
          $sum: "$quantity",
        },
      },
    },
  ]);

  return result[0]?.totalReserved || 0;
};

export const getTicketsByUser = async (userId) => {
  return TicketModel.find({
    user: userId,
  }).populate("event", "title date location");
};

export const getTicketsByEvent = async (eventId) => {
  return TicketModel.find({
    event: eventId,
  }).populate("user", "first_name last_name email");
};

export const getTicketById = async (ticketId) => {
  return TicketModel.findById(ticketId)
    .populate("event")
    .populate("user", "first_name last_name email");
};

export const cancelTicket = async (ticketId) => {
  return TicketModel.findByIdAndUpdate(
    ticketId,
    {
      status: "cancelled",
      cancelledAt: new Date(),
    },
    {
      new: true,
    },
  );
};
