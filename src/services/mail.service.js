import { transporter } from "../config/mailer.config.js";

export const sendTicketConfirmationEmail = async ({
  to,
  userName,
  eventTitle,
  ticketCode,
}) => {
  if (!process.env.MAIL_HOST || !process.env.MAIL_USER) {
    return;
  }

  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject: "Confirmación de inscripción",
    html: `
            <h1>Inscripción confirmada</h1>
            <p>Hola ${userName}, tu inscripción fue confirmada.</p>
            <p>Evento: <strong>${eventTitle}</strong></p>
            <p>Código de reserva: <strong>${ticketCode}</strong></p>
        `,
  });
};
