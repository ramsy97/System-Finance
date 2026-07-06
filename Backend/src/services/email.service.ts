import nodemailer from 'nodemailer';
import prisma from '../config/database';

export async function sendEmail(to: string, subject: string, html: string, attachments?: any[]) {
  try {
    const settings = await prisma.companySettings.findUnique({ where: { id: 'default' } });
    if (!settings?.emailSmtpHost || !settings?.emailSmtpUser || !settings?.emailSmtpPass) {
      console.warn('SMTP not configured. Email not sent.');
      return;
    }
    const transporter = nodemailer.createTransport({
      host: settings.emailSmtpHost,
      port: settings.emailSmtpPort || 587,
      secure: settings.emailSmtpPort === 465,
      auth: { user: settings.emailSmtpUser, pass: settings.emailSmtpPass },
    });
    await transporter.sendMail({ from: `"${settings.name}" <${settings.emailSmtpUser}>`, to, subject, html, attachments });
    console.log(`Email sent to ${to}: ${subject}`);
  } catch (error) {
    console.error('Failed to send email:', error);
  }
}

export async function sendInvoiceEmail(invoice: any, pdfBuffer?: Buffer) {
  if (!invoice.contact?.email) return;
  const subject = `Invoice ${invoice.invoiceNumber} from ${invoice.companyName || 'Finance System'}`;
  const html = `<p>Dear ${invoice.contact.name},</p><p>Please find attached invoice <b>${invoice.invoiceNumber}</b> for Rp ${Number(invoice.totalAmount).toLocaleString('id-ID')}.</p><p>Due date: ${new Date(invoice.dueDate).toLocaleDateString('id-ID')}</p>`;
  await sendEmail(invoice.contact.email, subject, html, pdfBuffer ? [{ filename: `invoice_${invoice.invoiceNumber}.pdf`, content: pdfBuffer }] : undefined);
}
