import { TicketModel } from "../models/Ticket.js";

export class TicketDAO {
  async create(data) {
    return TicketModel.create(data);
  }

  async findActiveByUserAndEvent(userId, eventId) {
    return TicketModel.findOne({
      user: userId,
      event: eventId,
      status: {
        $in: ["confirmed", "pending"],
      },
    });
  }

  async countActiveByEvent(eventId) {
    const result = await TicketModel.aggregate([
      {
        $match: {
          event: eventId,
          status: {
            $in: ["confirmed", "pending"],
          },
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
  }

  async findByUser(userId) {
    return TicketModel.find({
      user: userId,
    }).populate("event", "title date location");
  }

  async findByEvent(eventId) {
    return TicketModel.find({
      event: eventId,
    }).populate("user", "first_name last_name email");
  }

  async findById(id) {
    return TicketModel.findById(id)
      .populate("event")
      .populate("user", "first_name last_name email");
  }

  async cancel(id) {
    return TicketModel.findByIdAndUpdate(
      id,
      {
        status: "cancelled",
        cancelledAt: new Date(),
      },
      {
        new: true,
      },
    );
  }
}
