import { EventModel } from "../models/Event.js";

export const getEvents = async (filter, options = {}) => {
  const { sort = "date", skip = 0, limit = 10 } = options;

  const [events, total] = await Promise.all([
    EventModel.find(filter)
      .populate("organizer", "first_name last_name email")
      .sort(sort)
      .skip(skip)
      .limit(limit),

    EventModel.countDocuments(filter),
  ]);

  return {
    events,
    total,
  };
};

export const getEventById = async (id) => {
  return EventModel.findById(id).populate(
    "organizer",
    "first_name last_name email",
  );
};

export const createEvent = async (eventData) => {
  return EventModel.create(eventData);
};

export const updateEvent = async (id, eventData) => {
  return EventModel.findByIdAndUpdate(id, eventData, {
    new: true,
    runValidators: true,
  });
};

export const updateEventStatus = async (id, status) => {
  return EventModel.findByIdAndUpdate(
    id,
    { status },
    {
      new: true,
      runValidators: true,
    },
  );
};
