export class EventResponseDTO {
  constructor(event) {
    this.id = event._id;
    this.title = event.title;
    this.description = event.description;
    this.category = event.category;
    this.date = event.date;
    this.location = event.location;
    this.capacity = event.capacity;
    this.price = event.price;
    this.status = event.status;

    if (event.organizer) {
      this.organizer = {
        id: event.organizer._id,
        first_name: event.organizer.first_name,
        last_name: event.organizer.last_name,
        email: event.organizer.email,
      };
    }
  }
}
