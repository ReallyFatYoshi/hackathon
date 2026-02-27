import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendInterviewScheduledEmail(
  chefEmail: string,
  chefName: string,
  scheduledAt: string,
  roomUrl: string
) {
  const date = new Date(scheduledAt).toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  })

  await resend.emails.send({
    from: 'MyChef <noreply@mychef.app>',
    to: chefEmail,
    subject: 'Your MyChef Interview is Scheduled',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1a1a1a;">Interview Scheduled — MyChef</h1>
        <p>Hi ${chefName},</p>
        <p>Your interview has been scheduled! Here are the details:</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Date & Time:</strong> ${date}</p>
          <p><strong>Format:</strong> Video call (in-platform)</p>
        </div>
        <p>To join your interview, log into your MyChef dashboard on the scheduled date and click <strong>"Join Interview"</strong>.</p>
        <p>Please join on time. Missing your interview without notice may result in your application being closed.</p>
        <p>Best of luck!<br/>The MyChef Team</p>
      </div>
    `,
  })
}

export async function sendApplicationStatusEmail(
  chefEmail: string,
  chefName: string,
  status: 'approved' | 'rejected'
) {
  const subject =
    status === 'approved'
      ? 'Congratulations! Your MyChef Application is Approved'
      : 'MyChef Application Update'

  const body =
    status === 'approved'
      ? `<p>Your application has been <strong>approved</strong>! You can now log in and start browsing events.</p>`
      : `<p>After careful review, we are unable to move forward with your application at this time. You're welcome to reapply in the future.</p>`

  await resend.emails.send({
    from: 'MyChef <noreply@mychef.app>',
    to: chefEmail,
    subject,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1a1a1a;">MyChef Application Update</h1>
        <p>Hi ${chefName},</p>
        ${body}
        <p>Thank you for your interest in MyChef.<br/>The MyChef Team</p>
      </div>
    `,
  })
}

export async function sendBookingConfirmedEmail(
  clientEmail: string,
  clientName: string,
  chefName: string,
  eventTitle: string,
  eventDate: string
) {
  await resend.emails.send({
    from: 'MyChef <noreply@mychef.app>',
    to: clientEmail,
    subject: `Booking Confirmed — ${eventTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1a1a1a;">Booking Confirmed</h1>
        <p>Hi ${clientName},</p>
        <p>Your booking with <strong>${chefName}</strong> for <strong>${eventTitle}</strong> on <strong>${eventDate}</strong> is confirmed. Payment is securely held in escrow and will be released to the chef after you confirm the event is complete.</p>
        <p>The MyChef Team</p>
      </div>
    `,
  })
}
