export class TicketResponseDTO {
  constructor(ticket) {
    this.id = ticket._id;
    this.status = ticket.status;
    this.quantity = ticket.quantity;
    this.reservationCode = ticket.reservationCode;
    this.createdAt = ticket.createdAt;
    this.cancelledAt = ticket.cancelledAt;

    if (ticket.event) {
      this.event = {
        id: ticket.event._id,
        title: ticket.event.title,
        date: ticket.event.date,
        location: ticket.event.location,
      };
    }

    if (ticket.user) {
      this.user = {
        id: ticket.user._id,
        first_name: ticket.user.first_name,
        last_name: ticket.user.last_name,
        email: ticket.user.email,
      };
    }
  }
}
