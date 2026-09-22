import { EventModel } from "../models/Event.js";

export class EventDAO {
  async findById(id) {
    return EventModel.findById(id).populate(
      "organizer",
      "first_name last_name email",
    );
  }

  async findAll(filter, options = {}) {
    const { sort = "date", skip = 0, limit = 10 } = options;

    return EventModel.find(filter)
      .populate("organizer", "first_name last_name email")
      .sort(sort)
      .skip(skip)
      .limit(limit);
  }

  async count(filter) {
    return EventModel.countDocuments(filter);
  }

  async create(data) {
    const event = await EventModel.create(data);

    return EventModel.findById(event._id).populate(
      "organizer",
      "first_name last_name email",
    );
  }

  async update(id, data) {
    return EventModel.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).populate("organizer", "first_name last_name email");
  }

  async updateStatus(id, status) {
    return EventModel.findByIdAndUpdate(
      id,
      { status },
      {
        new: true,
        runValidators: true,
      },
    ).populate("organizer", "first_name last_name email");
  }
}
